const Pipeline = require('../pipeline');
const { getMachineStats } = require('../../uow/machines/getMachineStatsUOW');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getMachineStatsPipeline(payload) {
    try {
        const machinesStats = new Pipeline([getMachineStats]);
        const result = await machinesStats.run(payload);
        return result;
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getMachineStatsPipeline;
