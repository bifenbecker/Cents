const BusinessSubscription = require('../../models/businessSubscription');
const Business = require('../../models/laundromatBusiness');

/**
 * Create the BusinessSubscription model using payload data
 *
 * @param {Object} payload
 */
async function createBusinessSubscription(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const businessSubscription = await BusinessSubscription.query(transaction)
            .insert({
                businessId: newPayload.business.id,
                stripeSubscriptionToken: newPayload.subscription.id,
                status: newPayload.subscription.status,
            })
            .returning('*');

        const business = await Business.query(transaction)
            .patch({
                subscriptionId: businessSubscription.id,
            })
            .findById(newPayload.business.id)
            .returning('*');

        newPayload.businessSubscription = businessSubscription;
        newPayload.business = business;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createBusinessSubscription;
