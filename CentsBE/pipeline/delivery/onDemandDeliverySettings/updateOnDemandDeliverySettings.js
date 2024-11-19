const Pipeline = require('../../pipeline');

// Uows
const demandSettingsUOW = require('../../../uow/delivery/updateDemandDeliverySettingsUOW');

async function updateOnDemandDeliverySettingPipeline(payload) {
    try {
        const demandSettingsPipeline = new Pipeline([demandSettingsUOW]);
        const result = await demandSettingsPipeline.run(payload);
        return result;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOnDemandDeliverySettingPipeline;
