const ServicePrice = require('../../../models/servicePrices');
const { serviceCategoryTypes } = require('../../../constants/constants');

/**
 * Get a list of available laundry services for a store based on delivery tier availability
 *
 * @param {Object} payload
 */
async function getAvailableLaundryServicesForStore(payload) {
    try {
        const newPayload = payload;
        const { transaction, storeId, storeSettings, hasDeliveryTier } = newPayload;

        if (hasDeliveryTier) {
            const tierId = storeSettings?.deliveryTierId;
            const laundryServices = await ServicePrice.query(transaction)
                .withGraphJoined('[service.[serviceCategory.[serviceCategoryType]]]')
                .where({
                    pricingTierId: tierId,
                    storeId: null,
                    isDeliverable: true,
                })
                .andWhere(
                    'service:serviceCategory:serviceCategoryType.type',
                    serviceCategoryTypes.LAUNDRY,
                );
            newPayload.laundryServices = laundryServices;
        } else {
            const laundryServices = await ServicePrice.query(transaction)
                .withGraphJoined('[service.[serviceCategory.[serviceCategoryType]]]')
                .where({
                    pricingTierId: null,
                    storeId,
                    isDeliverable: true,
                })
                .andWhere(
                    'service:serviceCategory:serviceCategoryType.type',
                    serviceCategoryTypes.LAUNDRY,
                );
            newPayload.laundryServices = laundryServices;
        }

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = getAvailableLaundryServicesForStore;
