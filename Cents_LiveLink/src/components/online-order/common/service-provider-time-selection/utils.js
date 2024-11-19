import {DateTime, Interval} from "luxon";

import {DELIVERY_PROVIDERS, ORDER_DELIVERY_TYPES} from "../../../../constants/order";
import {RETURN_METHODS} from "../../../order-summary/constants";
import {bufferRequiredForOrder} from "../../constants";
import {getTimeFromMilliSeconds} from "../../utils";

import {getDoorDashDeliveryEstimate} from "../../../../api/doordash";

import windowSelectionActions from "./actions";

const findWindowsAndTimingForGivenTime = ({
  time,
  dayWiseWindows: givenDayWiseWindows,
  isThirdPartyDelivery,
  timeZone,
  isAutoScheduleDelivery,
}) => {
  const initialDeliveryDay = getWeekDay(time);
  const dayWiseWindows =
    givenDayWiseWindows?.filter(dayWindows => dayWindows?.timings?.length) || [];
  const daysAvailable = (dayWiseWindows || []).map(timing => timing.day);
  let givenTime = time;
  let deliveryTiming;

  // If time windows are available for the day on which auto delivery falls
  if (daysAvailable.includes(initialDeliveryDay)) {
    deliveryTiming = getFirstTimingForDay(
      givenTime,
      dayWiseWindows,
      !isThirdPartyDelivery,
      timeZone,
      {isAutoScheduleDelivery}
    );
  }

  // If delivery day does not have desired time window or delivery day is not in daysAvailable
  if (!deliveryTiming) {
    // Find the next available delivery day.
    const {newDay: newDeliveryDay, daysToBeMoved} = getNextAvailableDay(
      initialDeliveryDay,
      daysAvailable
    );
    givenTime = givenTime.plus({days: daysToBeMoved});

    if (daysToBeMoved <= 6) {
      const {timings} = dayWiseWindows?.find(
        timings => timings.day === newDeliveryDay
      ) || {
        timings: [],
      };
      deliveryTiming = timings[0];

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

export const getWeekDay = day => (day?.weekday === 7 ? 0 : day?.weekday);

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

export const generateOnDemandWindowOptions = ({
  storeSettings,
  selectedDate,
  timeZone,
  minTimeInMillis,
}) => {
  const storeTiming = storeSettings?.dayWiseWindows.find(
    timing => `${timing.day}` === `${getWeekDay(selectedDate)}`
  )?.timings?.[0];
  if (!storeTiming) return [];

  const minTimeForTimings = minTimeInMillis
    ? DateTime.fromMillis(minTimeInMillis).setZone(timeZone)
    : DateTime.local().setZone(timeZone);

  if (selectedDate?.startOf("day") < minTimeForTimings.startOf("day")) {
    return [];
  }

  let {startTime: shiftStartTime, endTime: shiftEndTime} = getStartAndEndTimes(
    selectedDate,
    storeTiming,
    timeZone
  );

  const storeStartTime =
    minTimeForTimings > shiftStartTime &&
    isSameDay(minTimeForTimings, selectedDate, timeZone)
      ? minTimeForTimings
      : shiftStartTime;
  const storeEndTime = shiftEndTime;

  let stopLoop;
  let endTime = getOnDemandStartTimeFromGivenTime(storeStartTime);
  let times = [];

  while (!stopLoop) {
    const startTime = endTime;
    endTime = startTime.plus({minutes: 30});

    if (storeEndTime >= endTime) {
      times.push(buildWindowOption(startTime, endTime, storeTiming.id));
    } else {
      stopLoop = true;
    }
  }

  return times;
};

export const getShiftDiffInDays = timing => {
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

export const generateOwnDriverWindowOptions = ({
  storeSettings,
  selectedDate,
  timeZone,
  minTimeInMillis,
}) => {
  const storeTimings = storeSettings?.dayWiseWindows?.find(
    timing => `${timing.day}` === `${getWeekDay(selectedDate)}`
  )?.timings;
  if (!storeTimings?.length) return [];

  const minTimeForTimings = minTimeInMillis
    ? DateTime.fromMillis(minTimeInMillis).setZone(timeZone)
    : DateTime.local().setZone(timeZone);
  return storeTimings
    .map(timing => {
      const {startTime, endTime} = getStartAndEndTimes(selectedDate, timing, timeZone);

      const diffInMins = startTime?.diff(minTimeForTimings, "minutes")?.toObject()
        ?.minutes;
      return !isSameDay(minTimeForTimings, selectedDate, timeZone) ||
        (minTimeInMillis
          ? diffInMins >= 0
          : diffInMins > bufferRequiredForOrder.OWN_DRIVER)
        ? buildWindowOption(startTime, endTime, timing.id)
        : null;
    })
    .filter(t => t);
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
  options = {}
) => {
  const {excludeBuffer = false} = options;
  return timings.find(timing => {
    const startTime = changeTimeZone(date, timing?.startTime, timeZone);
    return (
      givenTime <=
      startTime.minus({minutes: excludeBuffer ? 0 : bufferRequiredForOrder.OWN_DRIVER})
    );
  });
};

export const shouldAutoScheduleOwnDriverDelivery = (
  isDeliveryWindowSelectedManually,
  orderDelivery,
  updatedOrderDelivery,
  turnAroundInHours,
  timeZone,
  intakeCompletedAtInMillis = null
) => {
  if (isDeliveryWindowSelectedManually) {
    const deliveryStartTime = getTimeFromMilliSeconds(
      orderDelivery.delivery.deliveryWindow[0],
      timeZone
    );

    const validDeliveryStartTime = getTimeFromMilliSeconds(
      updatedOrderDelivery?.pickup?.deliveryWindow?.[0] || intakeCompletedAtInMillis,
      timeZone
    ).plus({
      hours: turnAroundInHours,
    });

    return deliveryStartTime < validDeliveryStartTime;
  }
  return false;
};

export const getAutoScheduledDelivery = (
  intakeCompletedAtOrPickupStartTime,
  currentDeliveryTiming,
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
    givenDayWiseWindows?.filter(dayWindows => dayWindows?.timings?.length) || [];

  if (!intakeCompletedAtOrPickupStartTime || !dayWiseWindows?.length) {
    return {};
  }

  const currentTime = DateTime.local().setZone(timeZone);
  let latestDeliveryStartTime = isProcessingCompleted
    ? currentTime
    : getTimeFromMilliSeconds(intakeCompletedAtOrPickupStartTime, timeZone).plus({
        hours: turnAroundInHours,
      });

  const deliveryProvider = isThirdPartyDelivery
    ? DELIVERY_PROVIDERS.doorDash
    : DELIVERY_PROVIDERS.ownDriver;

  if (latestDeliveryStartTime < currentTime) {
    latestDeliveryStartTime = currentTime;
  }

  const currentDeliveryStartTime = currentDeliveryTiming?.deliveryWindow?.[0]
    ? getTimeFromMilliSeconds(currentDeliveryTiming?.deliveryWindow?.[0], timeZone)
    : null;

  // If the current delivery time is already greater than the min time,
  // then return the current one only
  if (
    currentDeliveryStartTime &&
    isDeliveryWindowSelectedManually &&
    currentDeliveryStartTime > latestDeliveryStartTime
  ) {
    return {
      ...currentDeliveryTiming,
      deliveryProvider,
      selectedDate: currentDeliveryStartTime,
    };
  }

  const autoDelivery = findWindowsAndTimingForGivenTime({
    time: latestDeliveryStartTime,
    dayWiseWindows,
    isThirdPartyDelivery,
    timeZone,
    isAutoScheduleDelivery: isAutoScheduleDelivery && !isProcessingCompleted,
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
      : daysAvailable?.find(day => day > oldDay)) || daysAvailable[0];
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
  const {isAutoScheduleDelivery} = options || {};
  const weekday = getWeekDay(givenTime);
  const weekDayDetails = dayWiseWindows.find(date => date.day === weekday);

  if (isOwnDriver) {
    return getFirstAvailableOwnDriverWindow(
      givenTime,
      weekDayDetails.timings,
      timeZone,
      givenTime,
      {excludeBuffer: isAutoScheduleDelivery}
    );
  } else {
    return weekDayDetails?.timings?.find(eachTiming =>
      isThirdPartyWindowAvailable(givenTime, eachTiming, timeZone)
    );
  }
};

export const autoScheduleOrderDeliveryForSelectedDate = ({
  timeZone,
  isOwnDriver,
  deliverySettings,
  currentDate,
  minDate = DateTime.local(),
  isAutoScheduleDelivery,
}) => {
  let dateTime = currentDate.startOf("day").setZone(timeZone);
  const isCurrentDay = isSameDay(currentDate, minDate, timeZone);

  dateTime = isCurrentDay ? minDate.setZone(timeZone) : dateTime;
  const {dayWiseWindows} = deliverySettings;

  const windowTiming = getFirstTimingForDay(
    dateTime,
    dayWiseWindows,
    isOwnDriver,
    timeZone,
    {isAutoScheduleDelivery}
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

  const {timings} = dayWiseWindows?.find(timings => timings.day === weekDay) || {};
  if (!timings?.length) {
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
    return timings.find(timing => {
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
  deliverySettings
) => {
  const {dayWiseWindows} = deliverySettings;
  let currentTime = DateTime.local().setZone(timeZone);

  pickup.type = "PICKUP";
  pickup.deliveryProvider = isOwnDriver
    ? DELIVERY_PROVIDERS.ownDriver
    : DELIVERY_PROVIDERS.doorDash;

  const autoDelivery = findWindowsAndTimingForGivenTime({
    time: currentTime,
    dayWiseWindows,
    isThirdPartyDelivery: !isOwnDriver,
    timeZone,
  });

  pickup.timingsId = autoDelivery.timingsId;
  pickup.deliveryWindow = autoDelivery.deliveryWindow;
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
    dispatch({
      type: windowSelectionActions.ESTIMATE_CALL_STARTED,
      payload: {
        type,
      },
    });
    const doorDashEstimate = await getDoorDashDeliveryEstimate({
      type: type === "pickup" ? "PICKUP" : "RETURN",
      customerAddress,
      netOrderTotal: 1,
      deliveryTime: [Number(startTime), Number(endTime)],
      storeId,
    });
    dispatch({
      type: windowSelectionActions.SET_DOORDASH_ESTIMATE,
      payload: {
        type,
        doorDashEstimate: {
          estimateId: doorDashEstimate.data.id,
          totalDeliveryCost: Number(doorDashEstimate.data.estimateFee),
          pickupAt: doorDashEstimate.data.pickupTime,
        },
      },
    });
  } catch (err) {
    dispatch({
      type: windowSelectionActions.ESTIMATE_CALL_FAILED,
      payload: {
        type,
      },
    });
    onError && onError("Could not fetch return delivery estimate");
  }
};

export const buildOnSubmitPayload = ({
  pickup,
  delivery,
  storeSettings,
  returnMethod,
  onDemandDeliveryStore,
  ownDeliveryStore,
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
          ownDeliveryStore,
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
                ownDeliveryStore,
              }),
            },
    },
    returnMethod,
  };
};

const getDeliveryCostDetails = ({
  orderDelivery,
  onDemandDeliveryStore,
  ownDeliveryStore,
}) => {
  const {deliveryProvider, doorDashEstimate, uberEstimate, courierTip} = orderDelivery;
  const isUber = deliveryProvider === DELIVERY_PROVIDERS.uber;
  const isDoorDash = deliveryProvider === DELIVERY_PROVIDERS.doorDash;

  const {subsidyInCents} = onDemandDeliveryStore || {};
  const {deliveryFeeInCents} = ownDeliveryStore || {};

  if (isDoorDash || isUber) {
    const {totalDeliveryCost: thirdPartyDeliveryCost} = isDoorDash
      ? doorDashEstimate
      : uberEstimate;
    return {
      subsidyInCents,
      pickupAt: isUber ? uberEstimate?.pickupAt : null,
      thirdPartyDeliveryId: isUber ? uberEstimate?.estimateId : null,
      thirdPartyDeliveryCostInCents: thirdPartyDeliveryCost,
      totalDeliveryCost:
        thirdPartyDeliveryCost > subsidyInCents
          ? Number((thirdPartyDeliveryCost - subsidyInCents) / 100)
          : 0,
      courierTip: courierTip || 0,
    };
  }
  return {
    pickupAt: null,
    subsidyInCents: 0,
    thirdPartyDeliveryCostInCents: 0,
    thirdPartyDeliveryId: null,
    totalDeliveryCost: Number(Math.ceil(deliveryFeeInCents / 2) / 100) || 0,
    courierTip: 0,
  };
};
