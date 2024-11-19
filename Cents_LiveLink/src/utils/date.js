import {DateTime} from "luxon";

export const getCurrentTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Generate an array of human readable times to display for when a return delivery time window is selected
 *
 * @param {Array} deliveryWindows
 */
export const generateHumanReadableDeliveryWindow = (deliveryWindow, timezone) => {
  const startTime = DateTime.fromMillis(Number(deliveryWindow[0])).setZone(timezone);
  const endTime = DateTime.fromMillis(Number(deliveryWindow[1])).setZone(timezone);
  return `${startTime.weekdayLong}, ${startTime.monthShort} ${
    startTime.day
  }, ${startTime.toFormat("hh:mma")} - ${endTime.toFormat("hh:mma")}`;
};

export const formatTimeWindow = (window, timeZone, options = {}) => {
  return window?.length === 2
    ? [
        DateTime.fromMillis(Number(window[0]))
          .setZone(timeZone)
          .toFormat(`ccc${options.monthShort ? "" : "c"}, LLL dd, h:mma`),
        DateTime.fromMillis(Number(window[1])).setZone(timeZone).toFormat("h:mma"),
      ].join(" - ")
    : null;
};

export const formatWindow = (window, timeZone) => {
  return window?.length === 2
    ? [
        DateTime.fromMillis(Number(window[0])).setZone(timeZone).toFormat(`cccc, h:mma`),
        DateTime.fromMillis(Number(window[1])).setZone(timeZone).toFormat("h:mma"),
      ].join(" - ")
    : null;
};

export const formatJSTimeToReadableTime = (date, timeZone, options = {}) => {
  return DateTime.fromJSDate(new Date(date))
    .setZone(timeZone)
    .toFormat(`ccc${options.monthShort ? "" : "c"}, LLL dd, h:mma`);
};

export const getLuxonWeekDayFromMillis = (time, timeZone) => {
  return time ? DateTime.fromMillis(Number(time)).setZone(timeZone).weekday : null;
};

export const isSameTimeForWindows = (firstWindow, secondWindow, timeZone) => {
  if (!firstWindow.length && !secondWindow.length) {
    return true;
  } else {
    const firstWindowStartTime = firstWindow?.[0]
      ? DateTime.fromMillis(Number(firstWindow?.[0])).setZone(timeZone)
      : null;
    const firstWindowEndTime = firstWindow?.[1]
      ? DateTime.fromMillis(Number(firstWindow?.[1])).setZone(timeZone)
      : null;
    const secondWindowStartTime = secondWindow?.[0]
      ? DateTime.fromMillis(Number(secondWindow?.[0])).setZone(timeZone)
      : null;
    const secondWindowEndTime = secondWindow?.[1]
      ? DateTime.fromMillis(Number(secondWindow?.[1])).setZone(timeZone)
      : null;

    return (
      firstWindowStartTime?.hour === secondWindowStartTime?.hour &&
      firstWindowStartTime?.minute === secondWindowStartTime?.minute &&
      firstWindowEndTime?.hour === secondWindowEndTime?.hour &&
      firstWindowEndTime?.minute === secondWindowEndTime?.minute
    );
  }
};

export const getTimeFromMilliSeconds = (timeInMilliSeconds, timeZone) => {
  return DateTime.fromMillis(Number(timeInMilliSeconds)).setZone(timeZone);
};

export const isSameDay = (firstDate, secondDate, timeZone) => {
  return firstDate
    .setZone(timeZone)
    .startOf("day")
    .equals(secondDate.setZone(timeZone).startOf("day"));
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

export const getShiftWeekDay = (day) => (day?.weekday === 7 ? 0 : day?.weekday);

export const changeDateAndTimeZone = (date, timeInUTC, timeZone) => {
  const [year, month, day] = [date?.year, date?.month, date?.day];
  const timeObj = DateTime.fromISO(timeInUTC, {zone: "UTC"});
  const [hour, minute] = [timeObj?.hour, timeObj?.minute];

  return DateTime.fromObject({year, month, day, hour, minute, zone: timeZone});
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
    startTime: changeDateAndTimeZone(date, timing?.startTime, timeZone),
    endTime: changeDateAndTimeZone(
      date?.plus({day: diffShiftTimingInDays}),
      timing?.endTime,
      timeZone
    ),
  };
};
