const Pipeline = require('../pipeline');
const validateTierUOW = require('../../uow/pricingTiers/validateTierUOW');

const valdiateTierPipeline = async (payload) => {
    try {
        const valdiateTierPipeline = new Pipeline([validateTierUOW]);
        const output = await valdiateTierPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = valdiateTierPipeline;
