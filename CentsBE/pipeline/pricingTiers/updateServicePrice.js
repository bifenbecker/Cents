const Pipeline = require('../pipeline');
const updateServicePriceUow = require('../../uow/pricingTiers/updateServicePriceUow');

const updateServicePrice = async (payload) => {
    try {
        const updateServicePricePipeline = new Pipeline([updateServicePriceUow]);
        const output = await updateServicePricePipeline.run(payload);
        return output.updatedServicePrice;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updateServicePrice;
