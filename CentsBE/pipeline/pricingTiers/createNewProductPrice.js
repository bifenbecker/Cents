const Pipeline = require('../pipeline');
const createNewProductPriceUow = require('../../uow/pricingTiers/createNewProductPriceUow');

const createNewProductPrice = async (payload) => {
    try {
        const createNewProductPricePipeline = new Pipeline([createNewProductPriceUow]);
        const output = await createNewProductPricePipeline.run(payload);
        return output.newProductPrice;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = createNewProductPrice;
