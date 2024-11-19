const io = require('../../socket/server/namespaces').namespaces;
const Pairing = require('../../models/pairing');
const { MACHINE_STATES } = require('../../lib/constants');
const checkIdempotency = require('../../commons/checkIdempotency');
const { signResponse } = require('../../lib/authentication');
const { addNewHeartBeat } = require('./heartBeat');
const { userResponseCreator } = require('../../utils/socketEventEmitters');
const getStore = require('../../utils/getMachineStore');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

// TODO update ui response.
const stop = async (machineId, cycle, idempotencyKey) => {
    try {
        LoggerHandler('debug', `Stop command received from machine: ${machineId}`);
        const isMachinePaired = await Pairing.query().findOne({
            machineId,
            isDeleted: false,
        });
        if (isMachinePaired) {
            const isIdempotent = await checkIdempotency(machineId, idempotencyKey);
            if (isIdempotent) {
                const response = await signResponse({
                    acknowledged: true,
                    machineId,
                    idempotencyKey,
                    requestType: 'finishCycle',
                });
                LoggerHandler('debug', `Idempotency found in machine : ${machineId}`);
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
                            'Idempotency found in the machine',
                        ),
                    );
            } else {
                if (
                    isMachinePaired.runningStatus !== 'STOP' &&
                    isMachinePaired.runningStatus !== 'IDLE' &&
                    isMachinePaired !== 'FINISHED' &&
                    isMachinePaired !== 'paired' &&
                    isMachinePaired.runningStatus !== null
                ) {
                    const newHeartBeat = {
                        time: new Date(),
                        status: MACHINE_STATES[cycle.status],
                        idempotencyKey,
                    };
                    await addNewHeartBeat(machineId, newHeartBeat, cycle);
                    const response = await signResponse({
                        acknowledged: true,
                        machineId,
                        idempotencyKey,
                        requestType: 'finishCycle',
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
                } else {
                    LoggerHandler('debug', `Machine already in stop state : ${machineId}`);
                    const response = await signResponse({
                        error: 'invalid_job_id',
                        machineId,
                        idempotencyKey,
                        requestType: 'finishCycle',
                    });
                    io.machine.to(machineId).emit('error', response);
                    const storeId = await getStore(machineId);
                    io.ui
                        .to(storeId)
                        .emit(
                            'MACHINE_RUNNING_STATUS_UPDATED',
                            userResponseCreator(
                                machineId,
                                isMachinePaired.deviceId,
                                'Error',
                                'Machine is already in stop state.',
                            ),
                        );
                }
            }
        } else {
            LoggerHandler('debug', `Invalid machineId: ${machineId}`);
            const response = await signResponse({
                error: 'Invalid machine id',
                machineId,
                idempotencyKey,
                requestType: 'finishCycle',
            });
            io.machine.to(machineId).emit('error', response);
        }
    } catch (error) {
        LoggerHandler('error', error);
    }
};

module.exports = exports = stop;
