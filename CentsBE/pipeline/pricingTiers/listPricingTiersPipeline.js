const Pipeline = require('../pipeline');
const listPricingTiersUow = require('../../uow/pricingTiers/listPricingTiersUow');

const listPricingTiersPipeline = async (payload) => {
    try {
        const listPricingTiersPipeline = new Pipeline([listPricingTiersUow]);
        const output = await listPricingTiersPipeline.run(payload);
        return output.tiers;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = listPricingTiersPipeline;
