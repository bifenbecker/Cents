const Pipeline = require('../pipeline');
const getMachinePricingUow = require('../../uow/machines/machinePricesSettings/getMachinePricingUow');
const getMachineSettingsUow = require('../../uow/machines/machinePricesSettings/getMachineSettingsUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getMachinePricesSettingsPipeline(payload, errorHandler) {
    try {
        const pricesSettingsPipeline = new Pipeline(
            [getMachinePricingUow, getMachineSettingsUow],
            errorHandler,
        );

        return pricesSettingsPipeline.run(payload);
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = getMachinePricesSettingsPipeline;
