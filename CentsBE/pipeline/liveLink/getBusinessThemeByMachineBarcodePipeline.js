const Pipeline = require('../pipeline');
const {
    getBusinessThemeByMachineBarcodeUow,
} = require('../../uow/liveLink/selfService/getBusinessThemeByMachineBarcodeUow');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function getBusinessThemeByMachineBarcodePipeline(payload) {
    try {
        const businessTheme = new Pipeline([getBusinessThemeByMachineBarcodeUow]);

        return businessTheme.run(payload);
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = getBusinessThemeByMachineBarcodePipeline;
