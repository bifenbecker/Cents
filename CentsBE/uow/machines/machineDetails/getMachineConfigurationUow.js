const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const MachineConfiguration = require('../../../mongooseModels/machineConfiguration');

async function getMachineConfigurationUow(payload) {
    try {
        const newPayload = payload;
        const machineConfiguration = await MachineConfiguration.findOne({
            LaundryMachineID: payload.machineId,
        });
        newPayload.machineConfiguration = machineConfiguration;
        return newPayload;
    } catch (err) {
        LoggerHandler('error', `Error in machine configurations:\n\n${err}`);
        throw err;
    }
}

module.exports = {
    getMachineConfigurationUow,
};
