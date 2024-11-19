const Pipeline = require('../pipeline');
const tierDetailsUOW = require('../../uow/pricingTiers/getTierDetails');

const getTierDetailsPipeline = async (payload) => {
    try {
        const tierDetailsPipeline = new Pipeline([tierDetailsUOW]);
        const output = await tierDetailsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = getTierDetailsPipeline;
