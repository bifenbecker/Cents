const Pipeline = require('../pipeline');
const updateTierDetailsUOW = require('../../uow/pricingTiers/updateTierDetails');

const updateTierPipeline = async (payload) => {
    try {
        const updateTierDetailsPipeline = new Pipeline([updateTierDetailsUOW]);
        const output = await updateTierDetailsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updateTierPipeline;
