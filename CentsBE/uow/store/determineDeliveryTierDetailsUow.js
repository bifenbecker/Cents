const { deliveryPriceTypes } = require('../../constants/constants');

/**
 * Fetch the StoreSettings for a given store
 *
 * @param {Object} payload
 */
async function determineDeliveryTierDetails(payload) {
    try {
        const newPayload = payload;
        const { storeSettings } = newPayload;

        if (
            storeSettings.deliveryTierId &&
            storeSettings.deliveryPriceType === deliveryPriceTypes.DELIVERY_TIER
        ) {
            newPayload.hasDeliveryTier = true;
        } else {
            newPayload.hasDeliveryTier = false;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = determineDeliveryTierDetails;
