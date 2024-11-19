import {DateTime} from "luxon";
import {
  buildWindowOption,
  getAutoScheduledDelivery,
  getOnDemandStartTimeFromGivenTime,
  getStartAndEndTimes,
  getWeekDay,
  isSameDay,
} from "components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {buildDeliveryOptions} from "components/common/order-sections/delivery-windows/service-provider-time-selection/reducer-functions";
import {getTimeFromMilliSeconds} from "utils/date";
import {DELIVERY_PROVIDERS} from "constants/order";

export const getEarliestDeliveryStartTime = (state) => {
  const {
    orderDelivery: {pickup, delivery},
    ownDriverDeliverySettings: ownDeliveryStore,
    onDemandDeliverySettings: onDemandDeliveryStore,
  } = state;

  // If processing is completed, current time is enough to set as latest delivery time.
  if (state.isProcessingCompleted) {
    return DateTime.local().setZone(state.timeZone);
  }

  const minTime = pickup?.deliveryWindow?.[0] || state.intakeCompletedAtInMillis || null;

  if (minTime) {
    const minTimeObject = getTimeFromMilliSeconds(minTime, state.timeZone);
    const minTimeWithTurnAround = minTimeObject.plus({hours: state.turnAroundInHours});

    const {deliveryWindow: [startTime] = []} = getAutoScheduledDelivery(
      minTimeObject,
      {},
      ownDeliveryStore?.ownDeliverySettings?.deliveryWindowBufferInHours,
      {
        ...buildDeliveryOptions({
          orderType: state.orderType,
          orderDelivery: {
            pickup,
            delivery,
          },
          isDeliveryWindowSelectedManually: true,
          ownDriverDeliverySettings: ownDeliveryStore,
          onDemandDeliverySettings: onDemandDeliveryStore,
          isPickup: state?.isPickup,
          pickupDayWiseWindows: state?.pickupDayWiseWindows,
          returnDayWiseWindows: state?.returnDayWiseWindows,
          timeZone: state.timeZone,
          turnAroundInHours: state.turnAroundInHours,
        }),
        isAutoScheduleDelivery: true,
      }
    ) || {deliveryWindow: []};

    if (!startTime) {
      return null;
    }

    const startTimeForAutoScheduledWindow = getTimeFromMilliSeconds(
      startTime,
      state.timeZone
    );

    const earliestTime = isSameDay(
      startTimeForAutoScheduledWindow,
      minTimeWithTurnAround,
      state.timeZone
    )
      ? minTimeWithTurnAround
      : startTimeForAutoScheduledWindow.startOf("day");

    return earliestTime > DateTime.local().setZone(state.timeZone)
      ? earliestTime
      : DateTime.local().setZone(state.timeZone);
  } else {
    return null;
  }
};

export const generateOnDemandWindowOptions = ({
  dayWiseWindows,
  selectedDate,
  timeZone,
  minTimeInMillis,
}) => {
  const storeTiming = dayWiseWindows?.find(
    (timing) => `${timing.day}` === `${getWeekDay(selectedDate)}`
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

export const generateOwnDriverWindowOptions = ({
  dayWiseWindows,
  selectedDate,
  timeZone,
  minTimeInMillis,
  bufferTimeInHours,
}) => {
  const storeTimings = dayWiseWindows?.find(
    (timing) => `${timing.day}` === `${getWeekDay(selectedDate)}`
  )?.timings;
  if (!storeTimings?.length) return [];

  const minTimeForTimings = minTimeInMillis
    ? DateTime.fromMillis(minTimeInMillis).setZone(timeZone)
    : DateTime.local().setZone(timeZone);
  return storeTimings
    .map((timing) => {
      const {startTime, endTime} = getStartAndEndTimes(selectedDate, timing, timeZone);

      const diffInMins = startTime
        ?.diff(minTimeForTimings, "minutes")
        ?.toObject()?.minutes;
      return (minTimeInMillis ? diffInMins >= 0 : diffInMins > bufferTimeInHours * 60)
        ? buildWindowOption(startTime, endTime, timing.id)
        : null;
    })
    .filter((t) => t);
};

export const getWindows = ({
  isPickup,
  pickupDayWiseWindows,
  returnDayWiseWindows,
  selectedDate,
  timeZone,
  isProcessingCompleted,
  earliestDeliveryStartTime,
  storeSettings,
  currentTabId,
}) => {
  const params = {
    dayWiseWindows: isPickup ? pickupDayWiseWindows : returnDayWiseWindows,
    selectedDate,
    timeZone,
    minTimeInMillis:
      isPickup || isProcessingCompleted ? null : earliestDeliveryStartTime?.ts,
    bufferTimeInHours:
      storeSettings?.deliveryWindowBufferInHours ||
      storeSettings?.ownDeliverySettings?.deliveryWindowBufferInHours,
  };

  let windows =
    !isPickup && !earliestDeliveryStartTime
      ? []
      : currentTabId === DELIVERY_PROVIDERS.ownDriver
      ? generateOwnDriverWindowOptions(params)
      : generateOnDemandWindowOptions(params);
  return windows;
};

export const getAllAvailableWindows = (scheduleState) => {
  const {
    isPickup,
    timeZone,
    isProcessingCompleted,
    pickupDayWiseWindows,
    returnDayWiseWindows,
    orderDelivery: {pickup, delivery},
    allPickupDayWiseWindows: {
      ownDriver: ownDriverWiseWindows,
      onDemand: onDemandWiseWindows,
    },
    ownDriverDeliverySettings: ownDeliveryStore,
    onDemandDeliverySettings: onDemandDeliveryStore,
  } = scheduleState;

  const selectedDate = isPickup ? pickup.selectedDate : delivery.selectedDate;
  const earliestDeliveryStartTime = getEarliestDeliveryStartTime(scheduleState);
  const ownWindows = pickupDayWiseWindows.map(({date}) => {
    return {
      date,
      windows:
        getWindows({
          isPickup,
          pickupDayWiseWindows: ownDriverWiseWindows,
          returnDayWiseWindows,
          selectedDate: date,
          timeZone,
          isProcessingCompleted,
          earliestDeliveryStartTime,
          storeSettings: ownDeliveryStore,
          currentTabId: DELIVERY_PROVIDERS.ownDriver,
        }) || [],
    };
  });

  let onDemandWindows = [];
  if ((isPickup ? pickupDayWiseWindows : returnDayWiseWindows)?.length && selectedDate) {
    onDemandWindows = pickupDayWiseWindows.map(({date}) => {
      return {
        date,
        windows: getWindows({
          isPickup,
          pickupDayWiseWindows: onDemandWiseWindows,
          returnDayWiseWindows,
          selectedDate: date,
          timeZone,
          isProcessingCompleted,
          earliestDeliveryStartTime,
          storeSettings: onDemandDeliveryStore,
          currentTabId: DELIVERY_PROVIDERS.doorDash,
        }),
      };
    });
  }

  return {
    haveOwn: -1 < ownWindows.findIndex((day) => day?.windows?.length),
    haveOnDemand: -1 < onDemandWindows.findIndex((day) => day?.windows?.length),
    ownWindows,
    onDemandWindows,
    isPickup,
  };
};
