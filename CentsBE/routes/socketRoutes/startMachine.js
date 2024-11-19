const io = require('../../socket/server/namespaces').namespaces;

const Pairing = require('../../models/pairing');

const checkIdempotency = require('../../commons/checkIdempotency');
const { signResponse } = require('../../lib/authentication');
const { MACHINE_STATES } = require('../../lib/constants');
const { addNewHeartBeat } = require('./heartBeat');
const getStore = require('../../utils/getMachineStore');
const { userResponseCreator } = require('../../utils/socketEventEmitters');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

const startMachine = async (machineId, idempotencyKey, cycle) => {
    try {
        LoggerHandler('debug', `START RECEIVED FROM MACHINE ${machineId}`);
        const isMachinePaired = await Pairing.query().findOne({
            machineId,
            isDeleted: false,
        });
        if (isMachinePaired) {
            const isIdempotent = await checkIdempotency(machineId, idempotencyKey);
            if (isIdempotent) {
                LoggerHandler('debug', `Idempotency found in machine : ${machineId}`);
                const response = await signResponse({
                    acknowledged: true,
                    machineId,
                    idempotencyKey,
                    requestType: 'startCycle',
                });
                io.machine.to(machineId).emit('idempotencyError', response);
                const storeId = await getStore(machineId);
                io.ui
                    .to(storeId)
                    .emit(
                        'MACHINE_RUNNING_STATUS_UPDATED',
                        userResponseCreator(
                            machineId,
                            isMachinePaired.deviceId,
                            'Error',
                            'Idempotency found in the machine event.',
                        ),
                    );
                // emit event to the ui.
            } else {
                if (
                    isMachinePaired.runningStatus === 'STOP' ||
                    isMachinePaired.runningStatus === 'IDLE' ||
                    isMachinePaired.runningStatus === 'FINISHED' ||
                    isMachinePaired.runningStatus === 'paired' ||
                    isMachinePaired.runningStatus === null
                ) {
                    const { status } = cycle;
                    const newHeartBeat = {
                        time: new Date(),
                        runningStatus: MACHINE_STATES[status]
                            ? MACHINE_STATES[status]
                            : MACHINE_STATES.IDLE,
                        idempotencyKey,
                    };
                    await addNewHeartBeat(machineId, newHeartBeat, cycle);
                    const response = await signResponse({
                        acknowledged: true,
                        machineId,
                        idempotencyKey,
                        requestType: 'startCycle',
                    });
                    io.machine.to(machineId).emit('acknowledgement', response);
                    const storeId = await getStore(machineId);
                    io.ui
                        .to(storeId)
                        .emit(
                            'MACHINE_RUNNING_STATUS_UPDATED',
                            userResponseCreator(
                                machineId,
                                isMachinePaired.deviceId,
                                isMachinePaired.runningStatus,
                            ),
                        );
                    LoggerHandler(
                        'debug',
                        `Response sent to ui for machine with id : ${machineId}`,
                    );
                } else {
                    const storeId = await getStore(machineId);
                    io.ui
                        .to(storeId)
                        .emit(
                            'MACHINE_RUNNING_STATUS_UPDATED',
                            userResponseCreator(
                                machineId,
                                isMachinePaired.deviceId,
                                'Error',
                                'Machine is already in running state.',
                            ),
                        );
                }
            }
        } else {
            LoggerHandler('debug', `Invalid machineId: ${machineId}`);
            const response = await signResponse({
                error: 'Invalid machine id.',
                machineId,
                idempotencyKey,
                requestType: 'startCycle',
            });
            io.machine.to(machineId).emit('error', response);
        }
    } catch (error) {
        LoggerHandler('error', error);
    }
};

module.exports = exports = {
    startMachine,
};
