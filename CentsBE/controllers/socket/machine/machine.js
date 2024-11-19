const io = require('../../../socket/server/namespaces').namespaces;

const { createHandlerFactory } = require('../../../lib/createHandlerFactory');
const { signResponse } = require('../../../lib/authentication');

const { startMachine } = require('../../../routes/socketRoutes/startMachine');
const finish = require('../../../routes/socketRoutes/stopMachine');
const heartBeat = require('../../../routes/socketRoutes/heartBeat').addHeartBeat;

const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');

const open = createHandlerFactory((socket, ctx, payload) => {
    const { machineId } = payload.payload;
    socket.join(machineId, async () => {
        try {
            const response = await signResponse({
                machineId,
                requestType: 'open',
            });
            LoggerHandler('info', 'Open received from machine with id', { machineId });
            io.machine.to(machineId).emit('acknowledgement', response);
        } catch (error) {
            LoggerHandler('error', error);
        }
    });
});

const startCycle = createHandlerFactory(async (socket, ctx, payload) => {
    try {
        const { machineId, idempotencyKey, cycle } = payload.payload;
        LoggerHandler('info', 'Machine start received from machine with id', machineId);
        await startMachine(machineId, idempotencyKey, cycle);
    } catch (error) {
        LoggerHandler('error', error);
    }
});

const finishCycle = createHandlerFactory(async (socket, ctx, payload) => {
    try {
        const { machineId, idempotencyKey, cycle } = payload.payload;
        LoggerHandler('info', 'Finish cycle received from machine with id ', machineId);
        await finish(machineId, cycle, idempotencyKey);
    } catch (error) {
        LoggerHandler('error', error);
    }
});

const heartBeatCycle = createHandlerFactory(async (socket, ctx, payload) => {
    try {
        const { machineId, cycle, idempotencyKey } = payload.payload;
        LoggerHandler('info', 'Heart Beat received from machine', machineId);
        await heartBeat(machineId, cycle, idempotencyKey);
    } catch (error) {
        LoggerHandler('error', error);
    }
});

module.exports = {
    open,
    heartBeatCycle,
    startCycle,
    finishCycle,
};
