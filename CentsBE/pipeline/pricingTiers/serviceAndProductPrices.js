const Pipeline = require('../pipeline');
const productPricesUow = require('../../uow/pricingTiers/productPricesUow');
const servicePricesUow = require('../../uow/pricingTiers/servicePricesUow');
const addNewServiceWIthPricesUow = require('../../uow/pricingTiers/addNewServiceWIthPricesUow');
const addNewProductWIthPricesUow = require('../../uow/pricingTiers/addNewProductWIthPricesUow');

const serviceAndProductPrices = async (payload) => {
    try {
        const serviceAndProductPricesPipeline = new Pipeline([
            productPricesUow,
            servicePricesUow,
            addNewProductWIthPricesUow,
            addNewServiceWIthPricesUow,
        ]);
        const output = await serviceAndProductPricesPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = serviceAndProductPrices;
