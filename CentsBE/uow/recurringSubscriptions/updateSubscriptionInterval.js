const RecurringSubscription = require('../../models/recurringSubscription');
const RRuleService = require('../../services/rruleService');

/**
 * update subscription interval
 *
 * @param {*} payload
 */
const updateSubscriptionInterval = async (payload) => {
    try {
        const newPayload = payload;
        const { transaction, id, subscription, interval } = newPayload;

        if (!interval) {
            return newPayload;
        }

        const recurringServiceInstance = new RRuleService(subscription);
        const weekDay = recurringServiceInstance.getWeekday;
        const { dtstart } = recurringServiceInstance;
        const updatedRecurringRule = RRuleService.generateRule(interval, weekDay, dtstart);
        const updatedSubscription = await RecurringSubscription.query(transaction)
            .patch({
                recurringRule: updatedRecurringRule,
            })
            .findById(id)
            .returning('*');
        newPayload.subscription = updatedSubscription;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = exports = updateSubscriptionInterval;
