const Pipeline = require('../pipeline');
const { getMachineDetailsUow } = require('../../uow/machines/machineDetails/getMachineDetailsUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getMachineDetailsPipeline(payload) {
    try {
        const machinesDetails = new Pipeline([getMachineDetailsUow]);
        const result = await machinesDetails.run(payload);
        return result;
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getMachineDetailsPipeline;
