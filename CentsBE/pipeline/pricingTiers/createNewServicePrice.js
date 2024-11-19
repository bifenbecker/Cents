const Pipeline = require('../pipeline');
const createNewServicePriceUow = require('../../uow/pricingTiers/createNewServicePriceUow');

const createNewServicePrice = async (payload) => {
    try {
        const createNewServicePricePipeline = new Pipeline([createNewServicePriceUow]);
        const output = await createNewServicePricePipeline.run(payload);
        return output.newServicePrice;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = createNewServicePrice;
