const Pipeline = require('../../pipeline');

// Uows
const updateStoreSetting = require('../../../uow/store/updateStoreSettings');
const deliveryServicesUow = require('../../../uow/delivery/deliveryServicesUow');
const updateZonesUow = require('../../../uow/delivery/updateZonesUow');
const getActiveDeliverySettingsUow = require('../../../uow/delivery/getActiveDeliverySettingsUow');

async function updateDeliverySettingPipeline(payload) {
    try {
        const storePipeline = new Pipeline([
            updateStoreSetting,
            deliveryServicesUow,
            updateZonesUow,
            getActiveDeliverySettingsUow,
        ]);
        const output = await storePipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateDeliverySettingPipeline;
