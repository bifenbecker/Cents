const Pipeline = require('../pipeline');
const updateProductPriceUow = require('../../uow/pricingTiers/updateProductPriceUow');

const updateProductPrice = async (payload) => {
    try {
        const updateProductPricePipeline = new Pipeline([updateProductPriceUow]);
        const output = await updateProductPricePipeline.run(payload);
        return output.updatedProductPrice;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updateProductPrice;
