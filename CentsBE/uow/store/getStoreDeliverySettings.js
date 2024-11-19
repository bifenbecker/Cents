const GeneralDeliverySettingsService = require('../../services/deliverySettings/generalDeliverySettings');

async function getStoreDeliverySettings(payload) {
    try {
        const { storeId } = payload;

        const deliverySettingsService = new GeneralDeliverySettingsService(storeId);

        const storeDeliverySettings = await deliverySettingsService.ownDeliverySettings();

        return {
            ...payload,
            storeDeliverySettings,
        };
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getStoreDeliverySettings;
