import {DateTime, Interval} from "luxon";

import {DELIVERY_PROVIDERS, ORDER_DELIVERY_TYPES} from "../../../../../constants/order";
import {ORDER_TYPES, RETURN_METHODS} from "../../../../order-summary/constants";
import {bufferRequiredForOrder} from "../../../../online-order/constants";
import {getTimeFromMilliSeconds} from "../../../../../utils/date";

import {getDoorDashDeliveryEstimate} from "../../../../../api/doordash";

import {
  estimateCallFailedAction,
  estimateCallStartedAction,
  setDoordashEstimateAction,
  setOwnDriverDeliveryFeeAction,
} from "./actions";
import {canUpdateOrderDelivery} from "../../../../../utils";
import {getOwnDriverDeliveryFee} from "../../../../../api/delivery.js";

const findWindowsAndTimingForGivenTime = ({
  time,
  dayWiseWindows: givenDayWiseWindows,
  isThirdPartyDelivery,
  timeZone,
  isAutoScheduleDelivery,
  bufferTimeInHours,
}) => {
  const initialDeliveryDay = getWeekDay(time);
  const dayWiseWindows =
    givenDayWiseWindows?.filter((dayWindows) => dayWindows?.timings?.length) || [];
  const daysAvailable = (dayWiseWindows || []).map((timing) => timing.day);
  let givenTime = time;
  let deliveryTiming;

  // If time windows are available for the day on which auto delivery falls
  if (daysAvailable.includes(initialDeliveryDay)) {
    deliveryTiming = getFirstTimingForDay(
      givenTime,
      dayWiseWindows,
      !isThirdPartyDelivery,
      timeZone,
      {bufferTimeInHours, isAutoScheduleDelivery}
    );
  }

  // If delivery day does not have desired time window or delivery day is not in daysAvailable
  if (!deliveryTiming) {
    // Find the next available delivery day.
    const {newDay: newDeliveryDay, daysToBeMoved} = getNextAvailableDay(
      initialDeliveryDay,
      daysAvailable
    );
    givenTime = daysToBeMoved ? givenTime.plus({days: daysToBeMoved}) : givenTime;

    if (daysToBeMoved <= 6) {
      const {timings} = dayWiseWindows?.find(
        (timings) => timings?.day === newDeliveryDay
      ) || {
        timings: [],
      };
      deliveryTiming = timings?.[0];

      if (isThirdPartyDelivery) {
        // Since we need to take the first available slot, for third party providers,
        // it should be start from the startTime of the timing(since there will be only one timing)
        givenTime = changeTimeZone(givenTime, deliveryTiming?.startTime, timeZone);
      }
    }
  }

  return deliveryTiming
    ? {
        timingsId: deliveryTiming.id,
        deliveryWindow: getDeliveryWindow(
          givenTime,
          deliveryTiming,
          isThirdPartyDelivery,
          timeZone,
          isAutoScheduleDelivery
        ),
      }
    : {};
};

export const getNextDays = (limit, timeZone, selectedDate) => {
  const days = [];
  const date = selectedDate || DateTime.local();
  const today = date.setZone(timeZone).startOf("day");
  for (let i = 0; i < limit; i++) {
    const date = today.plus({day: i});
    days.push(date);
  }
  return days;
};

export const getWeekDay = (day) => (day?.weekday === 7 ? 0 : day?.weekday);

export const isSameDay = (firstDate, secondDate, timeZone) => {
  return firstDate
    .setZone(timeZone)
    .startOf("day")
    .equals(secondDate.setZone(timeZone).startOf("day"));
};

export const isToday = (date, timeZone) => isSameDay(DateTime.local(), date, timeZone);

export const changeTimeZone = (date, timeInUTC, timeZone) => {
  const [year, month, day] = [date?.year, date?.month, date?.day];
  const timeObj = DateTime.fromISO(timeInUTC, {zone: "UTC"});
  const [hour, minute] = [timeObj?.hour, timeObj?.minute];

  return DateTime.fromObject({year, month, day, hour, minute, zone: timeZone});
};

export const buildWindowOption = (startTime, endTime, timingsId) => ({
  value: [+startTime, +endTime],
  display: [startTime.toFormat("hh:mma"), endTime.toFormat("hh:mma")].join(" - "),
  timingsId,
});

export const getOnDemandStartTimeFromGivenTime = (time, isAutoScheduleDelivery) => {
  const buffer = isAutoScheduleDelivery ? 0 : bufferRequiredForOrder.DOORDASH;
  return time.minute < 30 - buffer
    ? time.set({minute: 0, second: 0, millisecond: 0})
    : time.minute < 60 - buffer
    ? time.set({minute: 30, second: 0, millisecond: 0})
    : time.plus({hour: 1}).set({minute: 0, second: 0, millisecond: 0});
};

export const getShiftDiffInDays = (timing) => {
  return (
    new Date(timing?.endTime)?.getUTCDate() - new Date(timing?.startTime)?.getUTCDate() ||
    0
  );
};

export const getStartAndEndTimes = (date, timing, timeZone) => {
  const diffShiftTimingInDays = getShiftDiffInDays(timing);

  return {
    startTime: changeTimeZone(date, timing?.startTime, timeZone),
    endTime: changeTimeZone(
      date?.plus({day: diffShiftTimingInDays}),
      timing?.endTime,
      timeZone
    ),
  };
};

export const isThirdPartyWindowAvailable = (dateTime, timing, timeZone) => {
  const {endTime} = getStartAndEndTimes(dateTime, timing, timeZone);

  return dateTime < endTime?.minus({minutes: bufferRequiredForOrder.DOORDASH});
};

export const getFirstAvailableOwnDriverWindow = (
  date,
  timings,
  timeZone,
  givenTime,
  bufferTimeInHours,
  options = {}
) => {
  const {excludeBuffer = false} = options;
  return timings?.find((timing) => {
    const startTime = changeTimeZone(date, timing?.startTime, timeZone);
    return (
      givenTime <= startTime.minus({minutes: excludeBuffer ? 0 : bufferTimeInHours * 60})
    );
  });
};

export const getAutoScheduledDelivery = (
  intakeCompletedAtOrPickupStartTime,
  currentDeliveryTiming,
  bufferTimeInHours,
  options
) => {
  const {
    timeZone,
    dayWiseWindows: givenDayWiseWindows,
    turnAroundInHours,
    isThirdPartyDelivery,
    isDeliveryWindowSelectedManually,
    isAutoScheduleDelivery,
    isProcessingCompleted,
  } = options;

  const dayWiseWindows =
    givenDayWiseWindows?.filter((dayWindows) => dayWindows?.timings?.length) || [];

  if (!intakeCompletedAtOrPickupStartTime || !dayWiseWindows?.length) {
    return {};
  }

  const currentTime = DateTime.local().setZone(timeZone);
  let earliestDeliveryStartTime = isProcessingCompleted
    ? currentTime
    : getTimeFromMilliSeconds(intakeCompletedAtOrPickupStartTime, timeZone).plus({
        hours: turnAroundInHours,
      });

  const deliveryProvider = isThirdPartyDelivery
    ? DELIVERY_PROVIDERS.doorDash
    : DELIVERY_PROVIDERS.ownDriver;

  if (earliestDeliveryStartTime < currentTime) {
    earliestDeliveryStartTime = currentTime;
  }

  const currentDeliveryStartTime = currentDeliveryTiming?.deliveryWindow?.[0]
    ? getTimeFromMilliSeconds(currentDeliveryTiming?.deliveryWindow?.[0], timeZone)
    : null;

  // If the current delivery time is already greater than the min time,
  // then return the current one only
  if (
    currentDeliveryStartTime &&
    isDeliveryWindowSelectedManually &&
    currentDeliveryStartTime > earliestDeliveryStartTime
  ) {
    return {
      ...currentDeliveryTiming,
      deliveryProvider,
      selectedDate: currentDeliveryStartTime,
    };
  }

  const autoDelivery = findWindowsAndTimingForGivenTime({
    time: earliestDeliveryStartTime,
    dayWiseWindows,
    isThirdPartyDelivery,
    timeZone,
    isAutoScheduleDelivery: isAutoScheduleDelivery && !isProcessingCompleted,
    bufferTimeInHours,
  });

  const autoScheduledDeliveryDate = autoDelivery?.deliveryWindow?.[0]
    ? getTimeFromMilliSeconds(autoDelivery.deliveryWindow[0], timeZone)
    : null;

  return {
    deliveryWindow: [],
    timingsId: null,
    ...autoDelivery,
    selectedDate: autoScheduledDeliveryDate,
    deliveryProvider,
  };
};

/**
 * @param {*} oldDay The current day.
 * @param {*} daysAvailable How many days are there with windows.
 * @returns newDay and how many days to be moved.
 */
export const getNextAvailableDay = (oldDay, daysAvailable) => {
  const newDay =
    (daysAvailable?.includes(oldDay)
      ? daysAvailable[daysAvailable.indexOf(oldDay) + 1]
      : daysAvailable?.find((day) => day > oldDay)) || daysAvailable[0];
  const daysToBeMoved = newDay <= oldDay ? newDay - oldDay + 7 : newDay - oldDay;
  return {newDay, daysToBeMoved};
};

export const getDeliveryWindow = (
  givenTime,
  deliveryTiming,
  isThirdPartyDelivery,
  timeZone,
  isAutoScheduleDelivery
) => {
  if (isThirdPartyDelivery) {
    let startTime = givenTime;
    // If the given startTime is less than the current time, use the current time.
    if (startTime < DateTime.local().setZone(timeZone)) {
      startTime = DateTime.local().setZone(timeZone);
    }
    const shiftStartTime = changeTimeZone(startTime, deliveryTiming.startTime, timeZone);
    // If the given startTime is less than the shift start time,
    // force the window start time to take the shift start time.
    if (startTime < shiftStartTime) {
      startTime = shiftStartTime;
    }
    startTime = getOnDemandStartTimeFromGivenTime(startTime, isAutoScheduleDelivery);
    return [startTime?.ts, startTime.plus({minutes: 30})?.ts];
  } else {
    const changedTimes = getStartAndEndTimes(givenTime, deliveryTiming, timeZone);
    return [changedTimes?.startTime?.ts, changedTimes?.endTime?.ts];
  }
};

export const getFirstTimingForDay = (
  givenTime,
  dayWiseWindows,
  isOwnDriver,
  timeZone,
  options = {}
) => {
  const {bufferTimeInHours, isAutoScheduleDelivery} = options || {};
  const weekday = getWeekDay(givenTime);
  const weekDayDetails = dayWiseWindows.find((date) => date.day === weekday);

  if (isOwnDriver) {
    return getFirstAvailableOwnDriverWindow(
      givenTime,
      weekDayDetails?.timings,
      timeZone,
      givenTime,
      bufferTimeInHours,
      {excludeBuffer: isAutoScheduleDelivery}
    );
  } else {
    return weekDayDetails?.timings?.find((eachTiming) =>
      isThirdPartyWindowAvailable(givenTime, eachTiming, timeZone)
    );
  }
};

export const autoScheduleOrderDeliveryForSelectedDate = ({
  timeZone,
  isOwnDriver,
  dayWiseWindows,
  currentDate,
  minDate = DateTime.local(),
  bufferTimeInHours,
  isAutoScheduleDelivery,
}) => {
  let dateTime = currentDate.startOf("day").setZone(timeZone);
  const isCurrentDay = isSameDay(currentDate, minDate, timeZone);

  dateTime = isCurrentDay ? minDate.setZone(timeZone) : dateTime;

  const windowTiming = getFirstTimingForDay(
    dateTime,
    dayWiseWindows,
    isOwnDriver,
    timeZone,
    {bufferTimeInHours, isAutoScheduleDelivery}
  );

  return windowTiming
    ? {
        timingsId: windowTiming.id,
        deliveryWindow: getDeliveryWindow(
          dateTime,
          windowTiming,
          !isOwnDriver,
          timeZone,
          isAutoScheduleDelivery
        ),
      }
    : {};
};

export const hasSameDeliveryWindow = (
  deliveryWindow,
  dayWiseWindows,
  timeZone,
  isThirdPartyDelivery
) => {
  const [startTimeInMillis, endTimeInMillis] = deliveryWindow;
  const startTime = getTimeFromMilliSeconds(startTimeInMillis, timeZone);
  const endTime = getTimeFromMilliSeconds(endTimeInMillis, timeZone);
  const weekDay = getWeekDay(startTime);

  const {date, timings} =
    dayWiseWindows?.find((timings) => timings.day === weekDay) || {};
  if (!timings?.length || !isSameDay(date, startTime, timeZone)) {
    return;
  }
  // TODO: Need to confirm what to do if the windows are old.
  if (isThirdPartyDelivery) {
    const {startTime: timingStartTime, endTime: timingEndTime} = getStartAndEndTimes(
      startTime,
      timings[0],
      timeZone
    );
    return Interval.fromDateTimes(timingStartTime, timingEndTime).contains(startTime);
  } else {
    return timings.find((timing) => {
      const {startTime: timingStartTime, endTime: timingEndTime} = getStartAndEndTimes(
        startTime,
        timing,
        timeZone
      );
      return timingStartTime.equals(startTime) && timingEndTime.equals(endTime);
    })?.id;
  }
};

export const initAutoSchedulePickup = (
  pickup,
  timeZone,
  isOwnDriver,
  dayWiseWindows,
  bufferTimeInHours
) => {
  let currentTime = DateTime.local().setZone(timeZone);
  pickup.type = "PICKUP";
  pickup.deliveryProvider = isOwnDriver
    ? DELIVERY_PROVIDERS.ownDriver
    : DELIVERY_PROVIDERS.doorDash;

  const earliestDeliveryTime = bufferTimeInHours
    ? currentTime.plus({hours: bufferTimeInHours})
    : currentTime;
  const autoDelivery = findWindowsAndTimingForGivenTime({
    time: earliestDeliveryTime,
    dayWiseWindows,
    isThirdPartyDelivery: !isOwnDriver,
    timeZone,
    isAutoScheduleDelivery: true,
  });

  pickup.timingsId = autoDelivery?.timingsId;
  pickup.deliveryWindow = autoDelivery?.deliveryWindow;
};

export const isSameAsOriginalWindow = (originalOrderDelivery, orderDelivery) => {
  return (
    originalOrderDelivery?.deliveryWindow?.length &&
    orderDelivery?.deliveryWindow?.length &&
    originalOrderDelivery.timingsId === orderDelivery?.timingsId &&
    Number(originalOrderDelivery?.deliveryWindow?.[0]) ===
      Number(orderDelivery?.deliveryWindow?.[0]) &&
    Number(originalOrderDelivery?.deliveryWindow?.[1]) ===
      Number(orderDelivery?.deliveryWindow?.[1])
  );
};

export const getDoodashDeliveryEstimates = async ({
  deliveryWindow,
  type,
  dispatch,
  customerAddress,
  storeId,
  onError,
}) => {
  try {
    const [startTime, endTime] = deliveryWindow;
    dispatch(estimateCallStartedAction({type}));
    const doorDashEstimate = await getDoorDashDeliveryEstimate({
      type: type === "pickup" ? "PICKUP" : "RETURN",
      customerAddress,
      netOrderTotal: 1,
      deliveryTime: [Number(startTime), Number(endTime)],
      storeId,
    });
    dispatch(setDoordashEstimateAction({type, doorDashEstimate}));
  } catch (err) {
    dispatch(estimateCallFailedAction({type}));
    onError &&
      onError(err?.response?.data?.error || "Could not fetch return delivery estimate");
  }
};

export const fetchOwnDriverDeliveryFee = async ({
  dispatch,
  storeId,
  orderToken,
  onError,
}) => {
  try {
    const res = await getOwnDriverDeliveryFee({
      storeId,
      token: orderToken,
    });
    dispatch(
      setOwnDriverDeliveryFeeAction({
        ownDriverDeliveryFee: res?.data?.ownDeliveryStore?.deliveryFeeInCents,
      })
    );
  } catch (err) {
    onError && onError(err?.response?.data?.error || "Could not fetch delivery fee");
  }
};

export const buildOnSubmitPayload = ({
  pickup,
  delivery,
  storeSettings,
  returnMethod,
  onDemandDeliveryStore,
  orderType,
  deliveryFee,
}) => {
  const isInStorePickup = returnMethod === RETURN_METHODS.inStorePickup;
  return {
    orderDelivery: {
      pickup: {
        ...(pickup.id ? {id: pickup.id} : {}),
        timingsId: pickup.timingsId,
        storeId: storeSettings?.storeId,
        type: ORDER_DELIVERY_TYPES.pickup,
        deliveryWindow: pickup.deliveryWindow,
        deliveryProvider: pickup.deliveryProvider,
        doorDashEstimate: pickup.doorDashEstimate,
        courierTip: pickup.courierTip || 0,
        ...getDeliveryCostDetails({
          orderDelivery: pickup,
          onDemandDeliveryStore,
          orderType,
          deliveryFee,
        }),
      },
      delivery:
        isInStorePickup || !returnMethod
          ? {}
          : {
              ...(delivery.id ? {id: delivery.id} : {}),
              timingsId: delivery.timingsId,
              storeId: storeSettings?.storeId,
              type: ORDER_DELIVERY_TYPES.return,
              deliveryWindow: delivery.deliveryWindow,
              deliveryProvider: delivery.deliveryProvider,
              doorDashEstimate: delivery.doorDashEstimate,
              courierTip: delivery.courierTip || 0,
              ...getDeliveryCostDetails({
                orderDelivery: delivery,
                onDemandDeliveryStore,
                orderType,
                deliveryFee,
              }),
            },
    },
    returnMethod,
  };
};

const getDeliveryCostDetails = ({
  orderDelivery,
  onDemandDeliveryStore,
  orderType,
  deliveryFee,
}) => {
  const {deliveryProvider, doorDashEstimate, uberEstimate, courierTip} = orderDelivery;
  const isUber = deliveryProvider === DELIVERY_PROVIDERS.uber;
  const isDoorDash = deliveryProvider === DELIVERY_PROVIDERS.doorDash;

  const {subsidyInCents, returnOnlySubsidyInCents} = onDemandDeliveryStore || {};

  const finalSubsidyInCents = getSubsidyInCents({
    isPickup: orderDelivery?.type === ORDER_DELIVERY_TYPES.pickup,
    orderType,
    subsidyInCents,
    returnOnlySubsidyInCents,
  });

  if (isDoorDash || isUber) {
    const {totalDeliveryCost: thirdPartyDeliveryCost} = isDoorDash
      ? doorDashEstimate
      : uberEstimate;
    return {
      subsidyInCents: finalSubsidyInCents,
      pickupAt: isUber ? uberEstimate?.pickupAt : null,
      thirdPartyDeliveryId: isUber ? uberEstimate?.estimateId : null,
      thirdPartyDeliveryCostInCents: thirdPartyDeliveryCost,
      totalDeliveryCost:
        thirdPartyDeliveryCost > finalSubsidyInCents
          ? Number((thirdPartyDeliveryCost - finalSubsidyInCents) / 100)
          : 0,
      courierTip: courierTip || 0,
    };
  }
  return {
    pickupAt: null,
    subsidyInCents: 0,
    thirdPartyDeliveryCostInCents: 0,
    thirdPartyDeliveryId: null,
    totalDeliveryCost: Number(deliveryFee?.ownDriver?.deliveryFeeInCents / 100) || 0,
    courierTip: 0,
  };
};

export const getDeliveryProviderFromOrderDelivery = ({
  pickupOrReturn,
  hasStandardDeliverySettings,
  type,
  returnMethod,
}) => {
  // PICKUP
  //  If pickup can be updated
  // delivery provider is there -> get those delivery windows
  // delivery provider is not there -> then
  //if own driver is there get own driver else get on demand
  // DELIVERY
  //  If delivery can be updated and returnMethod is delivery
  // delivery provider is there -> get those delivery windows
  // delivery provider is not there -> then
  //if own driver is there get own driver else get on demand
  const isUpdatable =
    !pickupOrReturn?.status || canUpdateOrderDelivery(pickupOrReturn?.status);
  const isReturnDelivery =
    type === ORDER_DELIVERY_TYPES.pickup || returnMethod === RETURN_METHODS.delivery;
  if (isUpdatable && isReturnDelivery) {
    if (pickupOrReturn?.deliveryProvider) {
      return pickupOrReturn?.deliveryProvider;
    } else {
      return hasStandardDeliverySettings
        ? DELIVERY_PROVIDERS.ownDriver
        : DELIVERY_PROVIDERS.doorDash;
    }
  }
};

export const getEarliestDeliveryStartTime = (state) => {
  const {
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderDelivery,
    pickupStartTimeInMillis,
  } = state;
  const {pickup} = orderDelivery || {};
  let minTimeWithTurnAround;
  if (isProcessingCompleted) {
    return DateTime.local().setZone(timeZone);
  }
  const minTime =
    pickupStartTimeInMillis ||
    pickup?.deliveryWindow?.[0] ||
    intakeCompletedAtInMillis ||
    null;
  if (!minTime) {
    return;
  }
  const minTimeObject = getTimeFromMilliSeconds(minTime, timeZone);
  minTimeWithTurnAround = minTimeObject.plus({
    hours: turnAroundInHours,
  });

  return minTimeWithTurnAround > DateTime.local().setZone(timeZone)
    ? minTimeWithTurnAround
    : DateTime.local().setZone(timeZone);
};

export const getSubsidyInCents = ({
  isPickup,
  orderType,
  subsidyInCents,
  returnOnlySubsidyInCents,
}) => {
  return isPickup || orderType === ORDER_TYPES.online
    ? subsidyInCents
    : returnOnlySubsidyInCents;
};
