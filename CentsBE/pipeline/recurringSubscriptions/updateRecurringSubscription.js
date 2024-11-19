const Pipeline = require('../pipeline');

const updateSubscriptionsUowMapper = require('../../utils/updateSubscriptionsUowMapper');
/**
 * updates the recurring subscription
 * and returns the updated subscription
 *
 * @param {*} payload
 * @return {*}
 */
async function updateRecurringSubscriptionPipeline(payload) {
    try {
        const editSubscriptionPipeline = new Pipeline(updateSubscriptionsUowMapper(payload));
        const output = await editSubscriptionPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateRecurringSubscriptionPipeline;
