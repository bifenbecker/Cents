const ServicePrices = require('../../models/servicePrices');

const createNewServicePriceUow = async (payload) => {
    try {
        const { tierId, serviceId, field, value } = payload;

        const servicePrice = {
            serviceId,
            storePrice: field === 'storePrice' ? value : 0,
            minQty: field === 'minQty' ? value : 0,
            minPrice: field === 'minPrice' ? value : 0,
            isFeatured: field === 'isFeatured' ? value : true,
            isDeliverable: field === 'isDeliverable' ? value : false,
            isTaxable: field === 'isTaxable' ? value : false,
            pricingTierId: tierId,
        };
        payload.newServicePrice = await ServicePrices.query().insert(servicePrice).returning('*');
        return payload;
    } catch (error) {
        throw Error(error);
    }
};
module.exports = exports = createNewServicePriceUow;
