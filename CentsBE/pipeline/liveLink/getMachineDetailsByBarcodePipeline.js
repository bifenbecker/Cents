const Pipeline = require('../pipeline');
const {
    getMachineDetailsByBarcodeUow,
} = require('../../uow/liveLink/selfService/getMachineDetailsByBarcodeUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getMachineDetailsByBarcodePipeline(payload) {
    try {
        const machineDetails = new Pipeline([getMachineDetailsByBarcodeUow]);
        const output = machineDetails.run(payload);

        return output;
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getMachineDetailsByBarcodePipeline;
