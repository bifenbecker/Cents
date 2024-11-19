const RecurringSubscription = require('../../models/recurringSubscription');
const RRuleService = require('../../services/rruleService');
/**
 * reinstate the next pickup
 *
 * @param {*} payload
 */
const reinstateNextPickup = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, id, subscription, timeZone } = newPayload;

        const recurringServiceInstance = new RRuleService(subscription, timeZone);
        const cancelledPickupWindows = await recurringServiceInstance.reinstateNextPickup();
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

module.exports = exports = reinstateNextPickup;
