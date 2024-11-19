const ServicePrices = require('../../models/servicePrices');

/**
 * Toggle isDeliverable services for a tier
 *
 * @param {Number} price
 * @param {void} transaction
 */
async function updateDeliverableServicesofTier(price, transaction) {
    const updatedService = await ServicePrices.query(transaction)
        .where({
            id: price.id,
        })
        .patch({ isDeliverable: price.isDeliverable });
    return updatedService;
}

/**
 * Use incoming payload to toggle the deliverable status of services of a tier.
 *
 * @param {Object} payload
 */
const updateTierDeliverableServices = async (payload) => {
    try {
        const { prices, transaction } = payload;
        const updatedTierServices = prices.map((price) =>
            updateDeliverableServicesofTier(price, transaction),
        );
        await Promise.all(updatedTierServices);
    } catch (error) {
        throw Error(error);
    }
};
module.exports = exports = updateTierDeliverableServices;
