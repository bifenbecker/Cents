const ServicePrices = require('../../models/servicePrices');

async function deliveryServicesUow(payload) {
    try {
        const { deliveryServiceIds, storeId, transaction } = payload;

        if (typeof deliveryServiceIds !== 'undefined') {
            await ServicePrices.query(transaction)
                .patch({
                    isDeliverable: true,
                })
                .whereIn('serviceId', deliveryServiceIds)
                .where('storeId', storeId);
            await ServicePrices.query(transaction)
                .patch({
                    isDeliverable: false,
                })
                .whereNotIn('serviceId', deliveryServiceIds)
                .where('storeId', storeId);
        }
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = deliveryServicesUow;
