const { RRule, rrulestr } = require('rrule');
const moment = require('moment');

const { toDateWithTimezone } = require('../helpers/dateFormatHelper');
const SubscriptionQuery = require('./queries/subscriptionQuery');

// TODO: support store timezone
class RRuleService {
    /**
     *
     * @param {*} interval
     */

    static generateRule(interval, weekday, dtstart) {
        if (interval < 1 || weekday < 0) throw Error('Either interval or weekday is invalid');

        const rule = new RRule({
            dtstart,
            freq: RRule.WEEKLY,
            byweekday: weekday,
            interval,
        });
        return rule.toString();
    }

    constructor(subscription, timeZone, day) {
        this.rule = rrulestr(subscription.recurringRule);
        this.cancelledPickupWindows = subscription.cancelledPickupWindows || [];
        this.cancelledPickupWindow =
            this.cancelledPickupWindows[this.cancelledPickupWindows.length - 1];
        this.timeZone = timeZone;
        this.subscription = subscription;
        this.recurringSubscriptionId = subscription.id;
        this.pickupWindow = subscription.pickupWindow;
        this.day = Number(day);
        this.subscription = subscription;
    }

    get currentDate() {
        return toDateWithTimezone(new Date(), this.timeZone);
    }

    get getInterval() {
        return this.rule.options.interval;
    }

    get dtstart() {
        return this.rule.options.dtstart;
    }

    get getWeekday() {
        return this.rule.options.byweekday;
    }

    async hasActivePickup() {
        const hasActivePickup = await this.activePickup();
        return !!hasActivePickup;
    }

    async activePickup() {
        const activePickup = await new SubscriptionQuery(
            this.recurringSubscriptionId,
        ).activePickup();
        return activePickup;
    }

    async lastOrderDetails() {
        return new SubscriptionQuery(this.recurringSubscriptionId).lastOrderDetails();
    }

    async nextAvailablePickupWindow(skipCanceled = false) {
        // Fetch last subscribed pickup start time.
        // if (Is last order pickup completed/canceled)
        // YES
        // Find the next available pickup by adding frequency to last completed order.
        // Meaning, last subscribed pickup start time +
        // (total number of canceled pickups) * interval
        // Check if it is skipped or not to show the label
        // ELSE - Show that last order's actual pickup time.
        const lastOrderDetails = await this.lastOrderDetails();
        if (['COMPLETED', 'CANCELED', 'CANCELLED'].includes(lastOrderDetails.pickupStatus)) {
            const [pickupStartTimeInMillis, endTimeInMillis] =
                (lastOrderDetails.originalPickupWindow &&
                lastOrderDetails.originalPickupWindow.length
                    ? lastOrderDetails.originalPickupWindow
                    : lastOrderDetails.deliveryWindow) || [];
            const canceledWindowsAfterLastOrder = this.cancelledPickupWindows.filter(
                (pickupDate) =>
                    toDateWithTimezone(Number(pickupDate), this.timeZone).startOf('day').valueOf() >
                    toDateWithTimezone(Number(pickupStartTimeInMillis), this.timeZone)
                        .startOf('day')
                        .valueOf(),
            );
            let weeklyInterval = this.getInterval * (canceledWindowsAfterLastOrder.length + 1);
            // This code here will fix following.
            // If the last created order is in the past and the subscription orders
            // that should have been created after initial date were not created
            // due to the following reasons.
            // 1. Some issues in order creation.
            // 2. If the prev order was still active etc.

            // Finding out the new pickup date after the last order
            // and canceled windows after last order.
            // Meaning, lastOrderPickupDate + all canceled dates after the last order.
            let newPickupDate = toDateWithTimezone(Number(pickupStartTimeInMillis), this.timeZone)
                .add(weeklyInterval, 'w')
                .startOf('day');
            const todayStartOfTheDay = this.currentDate.startOf('day').valueOf();
            // If the pickup date is in future, then it means, it is working and
            // all the orders are created on time.
            // If the pickup date is in past, then some of the pickup creations failed.
            // Here, we are adding interval number of weeks for the last created order
            // until we find the date which is after the current date.
            if (newPickupDate.valueOf() <= todayStartOfTheDay) {
                while (newPickupDate.valueOf() <= todayStartOfTheDay) {
                    weeklyInterval += this.getInterval;
                    newPickupDate = newPickupDate.add(this.getInterval, 'w');
                }
            } else {
                const frequencyDiff = skipCanceled
                    ? canceledWindowsAfterLastOrder.length + 1
                    : canceledWindowsAfterLastOrder.length || 1;
                weeklyInterval = this.getInterval * frequencyDiff;
            }
            return [
                toDateWithTimezone(Number(pickupStartTimeInMillis), this.timeZone)
                    .add(weeklyInterval, 'w')
                    .valueOf(),
                toDateWithTimezone(Number(endTimeInMillis), this.timeZone)
                    .add(weeklyInterval, 'w')
                    .valueOf(),
            ];
        }
        return [
            toDateWithTimezone(Number(lastOrderDetails.deliveryWindow[0]), this.timeZone).valueOf(),
            toDateWithTimezone(Number(lastOrderDetails.deliveryWindow[1]), this.timeZone).valueOf(),
        ];
    }

    async cancelNextPickup() {
        if (this.isNextPickupCancelled())
            throw new Error("Sorry!! You can't cancel the next pickup");

        const [pickupStartTime] = await this.nextAvailablePickupWindow();
        this.cancelledPickupWindows.push(pickupStartTime);
        return this.cancelledPickupWindows;
    }

    isNextPickupCancelled() {
        if (!this.cancelledPickupWindow) return false;

        const cancelledPickupWindow = toDateWithTimezone(
            Number(this.cancelledPickupWindow),
            this.timeZone,
        ).valueOf();
        const currentDate = this.currentDate.valueOf();
        return moment(cancelledPickupWindow).diff(currentDate, 'days') >= 0;
    }

    reinstateNextPickup() {
        if (this.isNextPickupCancelled()) {
            this.cancelledPickupWindows.pop();
            return this.cancelledPickupWindows;
        }
        throw new Error("Sorry!! You can't reinitiate next pickup");
    }

    async canCreateNextRecurringOrder() {
        if (await this.hasActivePickup())
            throw new Error('Could not create order because there is an active pickup');
        if (this.isNextPickupCancelled())
            throw new Error('Could not create order because next pickup is canceled');
        const [pickupStartTime] = await this.nextAvailablePickupWindow(true);
        return (
            this.getStartOfDay(pickupStartTime).valueOf() ===
            this.getStartOfDay().add(1, 'day').valueOf()
        );
    }

    getStartOfDay(time = new Date()) {
        return toDateWithTimezone(time, this.timeZone).startOf('day');
    }
}

module.exports = RRuleService;
