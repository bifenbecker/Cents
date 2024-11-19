const RRuleService = require('../services/rruleService');
const Timings = require('../models/timings');

const { formatDeliveryWindow } = require('../helpers/dateFormatHelper');

const getMappedSubscription = async (subscription) => {
    const timeZone =
        subscription.store.settings && subscription.store.settings.timeZone
            ? subscription.store.settings.timeZone
            : 'America/Los_Angeles';

    const { cancelledPickupWindows, pickupWindow, returnWindow, pickupTimingsId } = subscription;

    const timings = await Timings.query().findById(pickupTimingsId).returning('day');
    const rruleService = new RRuleService(subscription, timeZone, timings.day);

    const nextAvailablePickupWindow = await rruleService.nextAvailablePickupWindow(true);
    const hasActivePickup = await rruleService.hasActivePickup();

    const nextPickupDatetime = formatDeliveryWindow(nextAvailablePickupWindow, timeZone, {
        dateFormat: 'MM/DD',
    });

    const nextAvailablePickup = formatDeliveryWindow(nextAvailablePickupWindow, timeZone, {
        dateFormat: 'dddd, MMMM Do',
    });

    const isNextPickupCancelled = rruleService.isNextPickupCancelled();

    const recurringDiscountInPercent = subscription.store.settings
        ? subscription.store.settings.recurringDiscountInPercent
        : 0;

    const pickup = formatDeliveryWindow(pickupWindow, timeZone);

    const delivery =
        returnWindow && returnWindow.length
            ? formatDeliveryWindow(returnWindow, timeZone)
            : "Text me when it's ready";

    return {
        recurringSubscriptionId: subscription.id,
        pickupTimingsId: subscription.pickupTimingsId,
        deliveryTimingsId: subscription.returnTimingsId,
        pickupWindow,
        returnWindow,
        centsCustomerId: subscription.centsCustomerId,
        centsCustomerAddress: subscription.address,
        servicePriceId: subscription.servicePriceId,
        modifierIds: subscription.modifierIds,
        paymentToken: subscription.paymentToken,
        cancelledPickupWindows,
        frequency: 'WEEKLY',
        pickup,
        delivery,
        nextPickupDatetime,
        nextAvailablePickup,
        isNextPickupCancelled,
        recurringDiscountInPercent,
        interval: rruleService.getInterval,
        canCancelPickup: !hasActivePickup,
    };
};

module.exports = exports = getMappedSubscription;
