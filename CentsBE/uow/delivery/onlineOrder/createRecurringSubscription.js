const { isEmpty } = require('lodash');
const { toDateWithTimezone } = require('../../../helpers/dateFormatHelper');
const RecurringSubscriptions = require('../../../models/recurringSubscription');
const RRuleService = require('../../../services/rruleService');
const Timings = require('../../../models/timings');

/**
 * Create the recurring subscription
 *
 * @param {Object} payload
 */

async function createRecurringSubscription(payload) {
    const {
        transaction,
        subscription,
        storeId,
        paymentToken,
        centsCustomerAddressId,
        centsCustomer,
        settings: { timeZone },
    } = payload;
    if (isEmpty(payload.subscription)) {
        return payload;
    }
    const weekday = await Timings.query().select('day').findById(subscription.pickupTimingsId);
    let date = toDateWithTimezone(Number(subscription.pickupWindow[0]), timeZone);
    date = new Date(
        Date.UTC(
            date.year(),
            date.month(),
            date.date(),
            date.hour(),
            date.minute(),
            date.second(),
            date.millisecond(),
        ),
    );
    const day = Number(weekday.day) === 0 ? 6 : Number(weekday.day) - 1;
    const recurringSubscription = await RecurringSubscriptions.query(transaction)
        .insert({
            storeId,
            centsCustomerId: centsCustomer.id,
            centsCustomerAddressId,
            recurringRule: RRuleService.generateRule(subscription.interval, day, date),
            pickupWindow: subscription.pickupWindow,
            returnWindow: subscription.returnWindow,
            pickupTimingsId: subscription.pickupTimingsId,
            returnTimingsId: subscription.deliveryTimingsId,
            servicePriceId: subscription.servicePriceId,
            paymentToken,
            modifierIds: subscription.modifierIds || [],
        })
        .returning('*');
    payload.recurringSubscription = recurringSubscription;
    return payload;
}

module.exports = exports = createRecurringSubscription;
