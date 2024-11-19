const RecurringSubscription = require('../../models/recurringSubscription');
const RRuleService = require('../../services/rruleService');

/**
 * cancel the next pickup
 *
 * @param {*} payload
 */
const cancelNextPickup = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, id, subscription, timeZone } = newPayload;

        const recurringServiceInstance = new RRuleService(subscription, timeZone);
        const cancelledPickupWindows = await recurringServiceInstance.cancelNextPickup();
        const updatedSubscription = await RecurringSubscription.query(transaction)
            .patch({
                cancelledPickupWindows,
            })
            .findById(id)
            .returning('*');
        newPayload.subscription = updatedSubscription;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = exports = cancelNextPickup;
