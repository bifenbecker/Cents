/* eslint-disable no-useless-catch */
const { startMachine } = require('./startMachine');
const stopMachine = require('./stopMachine');
const { addHeartBeat } = require('./heartBeat');

const startJob = async (machineId, idempotencyKey) => {
    // TODO: Read date from request
    try {
        await startMachine(machineId, idempotencyKey);
    } catch (error) {
        throw error;
    }
};

const stopJob = async (machineId, idempotencyKey, cycle) => {
    try {
        await stopMachine(machineId, idempotencyKey, cycle);
    } catch (error) {
        throw error;
    }
};

const heartBeatJob = async (machineId, cycle, idempotencyKey) => {
    try {
        await addHeartBeat(machineId, cycle, idempotencyKey);
    } catch (error) {
        throw error;
    }
};

module.exports = { startJob, stopJob, heartBeatJob };
