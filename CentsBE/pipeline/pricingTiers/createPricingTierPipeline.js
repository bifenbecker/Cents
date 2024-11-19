const Pipeline = require('../pipeline');
const createPricingTierUow = require('../../uow/pricingTiers/createPricingTierUow');
const createServicePricesUow = require('../../uow/pricingTiers/createServicePricesUow');
const createInventoryPricesUow = require('../../uow/pricingTiers/createInventoryPricesUow');

const createPricingTierPipeline = async (payload) => {
    try {
        const createPricingTierPipeline = new Pipeline([
            createPricingTierUow,
            createServicePricesUow,
            createInventoryPricesUow,
        ]);
        const output = await createPricingTierPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = createPricingTierPipeline;
