const StoreSettings = require('../../models/storeSettings');
const getPermittedParamsObject = require('../../utils/permittedParams');

/**
 * Updates settings for a given store
 *
 * @param {Object} payload
 */
async function updateStoreSettings(payload) {
    try {
        const { storeId, transaction } = payload;
        const permittedParams = [
            'turnAroundInHours',
            'deliveryEnabled',
            'recurringDiscountInPercent',
            'deliveryTierId',
            'deliveryPriceType',
            'offerDryCleaningForDelivery',
            'dryCleaningDeliveryPriceType',
            'customLiveLinkHeader',
            'customLiveLinkMessage',
        ];
        const storeSettingsPayload = await getPermittedParamsObject(payload, permittedParams);
        await StoreSettings.query(transaction).patch(storeSettingsPayload).where({ storeId });

        return payload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateStoreSettings;
