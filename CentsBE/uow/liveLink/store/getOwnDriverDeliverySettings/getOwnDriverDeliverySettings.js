const GeneralDeliverySettingsService = require('../../../../services/deliverySettings/generalDeliverySettings');

async function getOwnDriverDeliverySettings(payload) {
    const { storeId } = payload;

    const deliverySettingsService = new GeneralDeliverySettingsService(storeId);

    const ownDriverDeliverySettings = (await deliverySettingsService.ownDeliverySettings()) || {};

    return {
        ...payload,
        deliverySettingsService,
        ownDriverDeliverySettings,
    };
}
module.exports = getOwnDriverDeliverySettings;
