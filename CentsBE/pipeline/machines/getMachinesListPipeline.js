const Pipeline = require('../pipeline');
const { getMachinesListUow } = require('../../uow/machines/machinesList/machinesListUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getMachinesListPipeline(payload) {
    try {
        const machinesList = new Pipeline([getMachinesListUow]);
        const result = await machinesList.run(payload);
        return result;
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getMachinesListPipeline;
