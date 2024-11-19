const { getSubscription } = require('../../queryHelpers/centsCustomer');
const getMappedSubscription = require('../../utils/getMappedSubscription');

/**
 * get Subscription details
 *
 * @param {*} payload
 * @return {*}
 */
async function getSubscriptionDetails(payload) {
    try {
        const newPayload = payload;
        const { subscription, transaction } = newPayload;
        if (!subscription) {
            return newPayload;
        }
        const updatedSubscription = await getSubscription(subscription.id, transaction);
        newPayload.mappedSubscription = await getMappedSubscription(updatedSubscription);

        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = getSubscriptionDetails;
