const ServicePrices = require('../../models/servicePrices');

const createServicePricesUow = async (payload) => {
    try {
        const { servicePrices, transaction } = payload;

        if (servicePrices && servicePrices.length) {
            const prices = servicePrices.map((price) => ({ ...price, pricingTierId: payload.id }));
            await ServicePrices.query(transaction).insert(prices).returning('*');
        }
        return payload;
    } catch (error) {
        throw Error(error.message);
    }
};
module.exports = exports = createServicePricesUow;
