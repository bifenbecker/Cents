const Pipeline = require('../pipeline');
const updateTierDeliverableServicesUow = require('../../uow/pricingTiers/updateTierDeliverableServicesUow');

const updateTierDeliverableServicesPipeline = async (payload) => {
    try {
        const updateTierDeliverableServicesPipeline = new Pipeline([
            updateTierDeliverableServicesUow,
        ]);
        const output = await updateTierDeliverableServicesPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = updateTierDeliverableServicesPipeline;
