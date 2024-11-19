const GeneralDeliverySettingsService = require('../../services/deliverySettings/generalDeliverySettings');

async function getActiveDeliverySettingsUow(payload) {
    try {
        const { storeId } = payload;
        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);

        const owndriverSettings = await deliverySettingsService.ownDeliverySettings(['active']);
        payload.isOwndriverSettingsActive = !!(owndriverSettings && owndriverSettings.active);

        const onDemandSettings = await deliverySettingsService.centsDeliverySettings(['active']);
        payload.isOnDemandSettingsActive = !!(onDemandSettings && onDemandSettings.active);
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = getActiveDeliverySettingsUow;
