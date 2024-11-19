/**
 * Use incoming payload to determine whether the store offers laundry and dry cleaning
 * for the live link
 *
 * @param {Object} payload
 */
async function validateDeliveryServicesForStore(payload) {
    try {
        const newPayload = payload;
        const { laundryServices, dryCleaningServices, storeSettings, hasDeliveryTier } = newPayload;

        newPayload.hasDryCleaning = dryCleaningServices?.length > 0;
        newPayload.hasLaundry = laundryServices?.length > 0;

        const offersDryCleaning = hasDeliveryTier
            ? storeSettings?.offerDryCleaningForDelivery &&
              storeSettings?.dryCleaningDeliveryPriceType === 'DELIVERY_TIER'
            : storeSettings?.offerDryCleaningForDelivery &&
              storeSettings?.dryCleaningDeliveryPriceType === 'RETAIL';

        newPayload.offerDryCleaningForDelivery = offersDryCleaning;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = validateDeliveryServicesForStore;
