const io = require('../../socket/server/namespaces').namespaces;

const Pairing = require('../../models/pairing');
const HeartBeat = require('../../mongooseModels/heartbeats');

const { MACHINE_STATES } = require('../../lib/constants');

const checkIdempotency = require('../../commons/checkIdempotency');
const { signResponse } = require('../../lib/authentication');
// const getStore = require('../../utils/getMachineStore');
const addSuperCycle = require('./superCycle');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
// const {  userResponseCreator } = require('../../utils/socketEventEmitters');

async function addNewHeartBeat(machineId, details, cycle) {
    try {
        await addSuperCycle(machineId, cycle);
        const machine = await HeartBeat.findOne({
            machineId,
        });
        if (machine) {
            machine.heartBeat.push(details);
            await machine.save();
        } else {
            const newMachine = {
                machineId,
                heartBeat: details,
            };
            await HeartBeat.create(newMachine);
        }
    } catch (error) {
        throw new Error(error);
    }
}

const addHeartBeat = async (machineId, cycle, idempotencyKey) => {
    try {
        const isMachinePaired = await Pairing.query().findOne({
            machineId,
        });
        if (isMachinePaired) {
            const isIdempotent = await checkIdempotency(machineId, idempotencyKey);
            if (isIdempotent) {
                LoggerHandler('debug', `Idempotency found in machine with id: ${machineId}`);
                const response = await signResponse({
                    acknowledged: true,
                    machineId,
                    idempotencyKey,
                    requestType: 'heartbeat',
                });
                io.machine.to(machineId).emit('idempotencyError', response);
            } else {
                const { status } = cycle;
                const newHeartBeat = {
                    time: new Date(),
                    status: MACHINE_STATES[status] ? MACHINE_STATES[status] : MACHINE_STATES.IDLE,
                    idempotencyKey,
                };

                await addNewHeartBeat(machineId, newHeartBeat, cycle);

                const response = await signResponse({
                    acknowledged: true,
                    machineId,
                    idempotencyKey,
                    requestType: 'heartbeat',
                });

                io.machine.to(machineId).emit('acknowledgement', response);
                // uncomment the following lines if need to
                // send an updated after every heart beat is received.
                // const storeId = await getStore(machineId);
                // io.ui.to(storeId).emit('MACHINE_RUNNING_STATUS_UPDATED',
                // userResponseCreator(machineId,
                //     isMachinePaired.deviceId,
                //     status: MACHINE_STATES[status] ? MACHINE_STATES[status] :
                // MACHINE_STATES.IDLE,
                //     'idempotency found in the machine event.'));
            }
        } else {
            LoggerHandler('debug', `Invalid machineId: ${machineId}`);
            const response = await signResponse({
                error: 'Invalid machine id.',
                machineId,
                idempotencyKey,
                requestType: 'heartBeat',
            });

            io.machine.to(machineId).emit('error', response);
        }
    } catch (error) {
        LoggerHandler('error', error);
    }
};

module.exports = exports = {
    addHeartBeat,
    addNewHeartBeat,
};
