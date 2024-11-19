const { map } = require('lodash');

const getMappedSubscription = require('../../../utils/getMappedSubscription');
const { subscriptions } = require('../../../queryHelpers/centsCustomer');

const listSubscriptionsUow = async (payload) => {
    const { transaction, centsCustomer, storeIds = [] } = payload;

    payload.subscriptions = await subscriptions(centsCustomer.id, transaction, storeIds);

    const formattedResponse = await Promise.all(
        await map(payload.subscriptions, (subscription) => getMappedSubscription(subscription)),
    );
    payload.formattedResponse = formattedResponse;
    return payload;
};

module.exports = exports = listSubscriptionsUow;
