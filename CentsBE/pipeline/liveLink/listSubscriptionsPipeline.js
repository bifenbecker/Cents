const Pipeline = require('../pipeline');

const listSubscriptionsUow = require('../../uow/liveLink/serviceOrders/listSubscriptionsUow');

const listSubscriptionsPipeline = async (payload) => {
    try {
        const listSubscriptionsPipeline = new Pipeline([listSubscriptionsUow]);
        const output = await listSubscriptionsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
};

module.exports = exports = listSubscriptionsPipeline;
