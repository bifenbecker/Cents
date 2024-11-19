const RecurringSubscription = require('../../../models/recurringSubscription');
const { utcDate } = require('../../../helpers/dateFormatHelper');
const RRuleService = require('../../../services/rruleService');

const updateSubscription = async (payload) => {
    const {
        transaction,
        subscription,
        storeSettings: { timeZone },
    } = payload;

    const date = utcDate(subscription.pickupWindow[0], timeZone);
    const prevRecurringSubscription = await RecurringSubscription.query().findById(subscription.id);
    const recurringSubscription = await RecurringSubscription.query(transaction)
        .patch({
            pickupWindow: subscription.pickupWindow,
            returnWindow: subscription.returnWindow,
            pickupTimingsId: subscription.pickupTimingsId,
            returnTimingsId: subscription.deliveryTimingsId,
            servicePriceId: subscription.servicePriceId,
            paymentToken: subscription.paymentToken,
            modifierIds: subscription.modifierIds || [],
            recurringRule: RRuleService.generateRule(
                subscription.interval,
                subscription.weekday,
                date,
            ),
        })
        .findById(subscription.id)
        .returning('*');
    payload.recurringSubscription = recurringSubscription;
    // Assuming that the newly updated subscription pickup time also updates the current order.
    // Adding this variable so that it can be used to update serviceOrderRecurringSubscription
    payload.newPickupWindow =
        Number(subscription.pickupWindow[0]) ===
            Number(prevRecurringSubscription.pickupWindow[0]) &&
        Number(subscription.pickupWindow[1]) ===
            Number(prevRecurringSubscription.pickupWindow[1]) &&
        subscription.pickupTimingsId === prevRecurringSubscription.pickupTimingsId
            ? null
            : subscription.pickupWindow;
    return payload;
};

module.exports = exports = updateSubscription;
