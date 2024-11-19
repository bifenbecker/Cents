const ServicePrice = require('../../../models/servicePrices');
const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Get a list of available dry cleaning services for a store based on delivery tier availability
 *
 * @param {Object} payload
 */
async function getAvailableDryCleaningServicesForStore(payload) {
    try {
        const newPayload = payload;
        const { transaction, storeId, storeSettings, hasDeliveryTier } = newPayload;

        if (hasDeliveryTier) {
            const tierId = storeSettings?.deliveryTierId;
            const dryCleaningServices = await ServicePrice.query(transaction)
                .withGraphJoined('[service.[serviceCategory.[serviceCategoryType]]]')
                .where({
                    pricingTierId: tierId,
                    storeId: null,
                })
                .andWhere(
                    'service:serviceCategory:serviceCategoryType.type',
                    serviceCategoryTypes.DRY_CLEANING,
                );
            newPayload.dryCleaningServices = dryCleaningServices;
        } else {
            const dryCleaningServices = await ServicePrice.query(transaction)
                .withGraphJoined('[service.[serviceCategory.[serviceCategoryType]]]')
                .where({
                    pricingTierId: null,
                    storeId,
                })
                .andWhere(
                    'service:serviceCategory:serviceCategoryType.type',
                    serviceCategoryTypes.DRY_CLEANING,
                );
            newPayload.dryCleaningServices = dryCleaningServices;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getAvailableDryCleaningServicesForStore;
