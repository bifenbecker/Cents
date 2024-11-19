import {ORDER_DELIVERY_TYPES} from "../../../../constants/order";
import {getLuxonWeekDayFromMillis, isSameTimeForWindows} from "../../../../utils/date";

const isSameAsWindowAsSubscription = (subscription, orderDelivery, timeZone) => {
  const isPickup = orderDelivery.type === ORDER_DELIVERY_TYPES.pickup;
  const {deliveryTimingsId, returnWindow, pickupTimingsId, pickupWindow} = subscription;
  const susbcriptionTimingsId = isPickup ? pickupTimingsId : deliveryTimingsId;
  const subscriptionWindow = isPickup ? pickupWindow : returnWindow;

  const subscriptionWeekDay = getLuxonWeekDayFromMillis(
    subscriptionWindow?.[0],
    timeZone
  );
  const weekDay = getLuxonWeekDayFromMillis(orderDelivery?.deliveryWindow?.[0], timeZone);

  return (
    (orderDelivery?.timingsId || null) === susbcriptionTimingsId &&
    weekDay === subscriptionWeekDay &&
    isSameTimeForWindows(
      orderDelivery?.deliveryWindow || [],
      subscriptionWindow || [],
      timeZone
    )
  );
};

export const checkIsSubscriptionWithSameTime = (
  newOrderDelivery,
  subscriptionList,
  timeZone
) => {
  return subscriptionList.some(subscription => {
    return (
      isSameAsWindowAsSubscription(subscription, newOrderDelivery?.pickup, timeZone) &&
      isSameAsWindowAsSubscription(subscription, newOrderDelivery?.delivery, timeZone)
    );
  });
};
