import moment from "moment";

export const getMinTimeForStartTime = (shifts, shiftIndex, dayIndex) => {
  const prevDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

  // If there is an previously active shift,
  // then use that shift's end time as min time for this shift
  const prevActiveShift = getPrevActiveShiftForDay(shifts, shiftIndex, dayIndex);

  if (prevActiveShift) {
    return prevActiveShift.timings[dayIndex].endTime;
  }

  // If there is no previous active shift
  // then check if there is a time that is spilled over from the previous day in all the shifts.
  const prevDaySpilledOverTime = shifts
    .map((shift) => {
      const prevDayTiming = shift.timings[prevDayIndex];

      return prevDayTiming?.isActive &&
        prevDayTiming?.startTime &&
        prevDayTiming?.endTime &&
        new Date(prevDayTiming.startTime).getUTCDate() !==
          new Date(prevDayTiming.endTime).getUTCDate()
        ? moment.utc(prevDayTiming?.endTime)
        : null;
    })
    .filter((t) => t)
    .sort()
    .reverse()[0];

  // If there is spilled over time,
  // then set the date of that to 1(Need to set to Epoch date 1970-01-01)
  // and use that as start time.
  if (prevDaySpilledOverTime) {
    return prevDaySpilledOverTime.date(1).toISOString();
  }

  // If there is no spilled over time,
  // Of if there is no prev shift,
  // then use the start of the day as min time
  return new Date(0).toISOString();
};

export const getMaxTimeForStartTime = (
  shifts,
  shiftIndex,
  dayIndex,
  tentativeEndTime = null
) => {
  const currentDayTimings = shifts[shiftIndex].timings[dayIndex];
  const eod = moment.utc(new Date(0)).endOf("day").toISOString();

  // if there is end time, then there could be 2 cases
  if (tentativeEndTime || currentDayTimings.endTime) {
    const endTime = tentativeEndTime || currentDayTimings.endTime;
    // case 1: if there is start time and the end time selected spilled over to the next day,
    // they should only be able to select until the EOD, but not for tomorrow.
    // case 2: If there is no start time, or if the end time didn' spill over,
    // then they should be able to select until the end time, but not EOD.
    return !currentDayTimings.startTime ||
      new Date(currentDayTimings.startTime).getUTCDate() !==
        new Date(endTime).getUTCDate()
      ? eod
      : endTime;
  }

  // If there is no end time, do what ever is done for max time of end time.
  const newMaxTime = getMaxTimeForEndTime(shifts, shiftIndex, dayIndex);

  // Since we don't want max time to be empty(which would mean, the options would show after today),
  // Or since we don't want to show times of the next day here,
  // by default, we will set it as EOD.
  return newMaxTime && new Date(newMaxTime).getUTCDate() === 1 ? newMaxTime : eod;
};

export const isValidStartTime = (
  shifts,
  shiftIndex,
  dayIndex,
  time,
  tentativeEndTime = null
) => {
  const minTime = getMinTimeForStartTime(shifts, shiftIndex, dayIndex);
  const maxTime = getMaxTimeForEndTime(shifts, shiftIndex, dayIndex, tentativeEndTime);
  if (minTime && !maxTime) {
    return moment.utc(time).isSameOrAfter(moment.utc(minTime));
  }

  if (!minTime && maxTime) {
    return moment.utc(time).isSameOrBefore(moment.utc(maxTime));
  }

  return moment.utc(time).isBetween(minTime, maxTime, undefined, "[]");
};

export const getMinTimeForEndTime = (
  shifts,
  shiftIndex,
  dayIndex,
  tentativeStartTime = null
) => {
  const currentDayTimings = shifts[shiftIndex].timings[dayIndex];

  // If there is start time selected for this timing, use that as min time.
  // Else, set up the min time same as that of start time's min time.
  // Although the else condition might not be relevent,
  // if the input is disabled when start time is empty
  return tentativeStartTime || currentDayTimings.startTime
    ? tentativeStartTime || currentDayTimings.startTime
    : getMinTimeForStartTime(shifts, shiftIndex, dayIndex);
};

export const getMaxTimeForEndTime = (shifts, shiftIndex, dayIndex) => {
  // Check if there is a next active shift
  const nextActiveShift = shifts
    .slice(shiftIndex + 1)
    .find(
      (shift) => shift.timings[dayIndex]?.isActive && shift.timings[dayIndex]?.startTime
    );

  // If there is a next active shift, then use that shift's startTime as the max time.
  if (nextActiveShift) {
    return nextActiveShift?.timings[dayIndex]?.startTime;
  }

  const nextDayIdx = dayIndex === 6 ? 0 : dayIndex + 1;

  // If there is no next active shift, check if there is start time next day.
  const nextDayMinStartTime = shifts
    .map((shift) => {
      return shift.timings[nextDayIdx]?.isActive && shift.timings[nextDayIdx]?.startTime
        ? moment.utc(shift.timings[nextDayIdx].startTime)
        : null;
    })
    .filter((t) => t)
    .sort()[0];

  // If there is a start time next dasy selected,
  // make that as max time for this day.
  if (nextDayMinStartTime) {
    return nextDayMinStartTime.date(2).toISOString();
  }

  // If there is no start time selected next day, we can utilize the next day's timings.
  return null;
};

// Returns the shifts array by filtering the timings of each shift with validity criteria to have either id or active status.
export const filterShiftwithValidTimings = (shifts) => {
  return shifts.map((shift) => {
    return {
      ...shift,
      timings: shift?.timings
        .filter(
          (timing) =>
            (timing?.isActive && timing.startTime && timing.endTime) || timing?.id
        )
        .map((timing) => {
          delete timing.zonesManuallyUpdated;
          return timing;
        }),
    };
  });
};

export const filterOnDemandShiftsData = (shifts) => {
  return shifts.map((shift) => {
    return {
      ...shift,
      timings: shift?.timings
        .filter(
          (timing) =>
            (timing?.isActive && timing.startTime && timing.endTime) || timing?.id
        )
        .map((timing) => {
          return {
            id: timing.id,
            endTime: timing.endTime,
            startTime: timing.startTime,
            day: timing.day,
            isActive: timing.isActive,
          };
        }),
    };
  });
};

export const isValidEndTime = (
  shifts,
  shiftIndex,
  dayIndex,
  time,
  tentativeStartTime = null
) => {
  const minTime = getMinTimeForEndTime(shifts, shiftIndex, dayIndex, tentativeStartTime);
  const maxTime = getMaxTimeForEndTime(shifts, shiftIndex, dayIndex);

  if (minTime && !maxTime) {
    return moment.utc(time).isSameOrAfter(moment.utc(minTime));
  }

  if (!minTime && maxTime) {
    return moment.utc(time).isSameOrBefore(moment.utc(maxTime));
  }

  return moment.utc(time).isBetween(minTime, maxTime, undefined, "[]");
};

export const getPrevActiveShiftForDay = (
  shifts,
  shiftIndex,
  dayIndex,
  startOrEnd = "endTime"
) => {
  return shifts
    .slice(0, shiftIndex)
    .reverse()
    .find(
      (shift) => shift.timings[dayIndex]?.isActive && shift.timings[dayIndex][startOrEnd]
    );
};

export const areShiftTimingsAvailable = (shifts, shiftIndex, dayIndex) => {
  const prevActiveShift = getPrevActiveShiftForDay(shifts, shiftIndex, dayIndex);

  if (
    prevActiveShift &&
    new Date(prevActiveShift.timings[dayIndex].endTime) >
      new Date(0).setUTCHours(23, 59, 59)
  ) {
    return false;
  }

  let tentativeShiftStartTime;

  if (prevActiveShift) {
    tentativeShiftStartTime = new Date(prevActiveShift.timings[dayIndex].endTime);
  } else {
    const prevDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    const prevDayLastShift = shifts
      .filter(
        (shift) =>
          shift.timings[prevDayIndex]?.isActive && shift.timings[prevDayIndex]?.endTime
      )
      .pop();
    const prevDayStoreEndingTime = prevDayLastShift
      ? new Date(prevDayLastShift.timings[prevDayIndex].endTime)
      : null;

    // If the store prev day does not end in the next day,
    // then the start time for the shift will start at 12.
    if (
      prevDayStoreEndingTime &&
      prevDayStoreEndingTime > new Date(0).setUTCHours(23, 59, 59)
    ) {
      tentativeShiftStartTime = new Date(prevDayStoreEndingTime.setUTCDate(1));
    }
  }

  const nextActiveShift = shifts
    .slice(shiftIndex + 1)
    .find(
      (shift) => shift.timings[dayIndex]?.isActive && shift.timings[dayIndex]?.startTime
    );

  if (!nextActiveShift) {
    return true;
  }

  if (tentativeShiftStartTime) {
    const momentShiftStartTime = moment.utc(tentativeShiftStartTime);
    const momentNextShiftStartTime = moment.utc(
      nextActiveShift.timings[dayIndex].startTime
    );
    const diffInMins = momentNextShiftStartTime.diff(momentShiftStartTime, "minutes");
    return diffInMins > 1;
  } else {
    return !moment.utc(nextActiveShift.timings[dayIndex].startTime).isSame(new Date(0));
  }
};

export const validateAllShifts = (shifts, _opts = {}) => {
  // const {overlapping = false} = opts;

  const shiftNames = shifts.map(({name}) => name);
  // check if shifts have distinct names
  if (new Set(shiftNames).size !== shiftNames.length) {
    return {
      isValid: false,
      error: `Please add distinct names`,
    };
  }

  // check if there at least one active shift with start and end times
  if (
    !shifts.some((shift) =>
      shift?.timings?.some(
        (timing) => timing?.isActive && timing?.startTime && timing?.endTime
      )
    )
  ) {
    return {
      isValid: false,
      error: "Please add at least one active time slot for a window",
    };
  }
  // const shiftsValidity = shifts.map((shift, shiftIndex) => {
  //   const hasAvailableTimings = !!shift?.timings?.filter(
  //     (timing) => timing.id || timing.isActive
  //   ).length;

  //   const allAvailableActiveTimings = shift?.timings?.filter(
  //     (timing, dayIndex) =>
  //       timing.isActive &&
  //       timing.startTime &&
  //       timing.endTime &&
  //       (overlapping || areShiftTimingsAvailable(shifts, shiftIndex, dayIndex))
  //   );

  //   const hasActiveAvailableTimings = allAvailableActiveTimings.every(
  //     (timing) => timing.startTime && timing.endTime
  //   );

  //   const hasOneActiveAvailableTimings = allAvailableActiveTimings.some(
  //     (timing) => timing.startTime && timing.endTime
  //   );

  //   return {
  //     shift,
  //     hasAvailableTimings,
  //     hasOneActiveAvailableTimings,
  //     hasActiveAvailableTimings,
  //   };
  // });

  // // Check if there is at least one shift with active timing with start and end time.
  // if (
  //   !shiftsValidity.some(({hasOneActiveAvailableTimings}) => hasOneActiveAvailableTimings)
  // ) {
  //   return {isValid: false, error: "Please add a few timings"};
  // }

  // const inValidShifts = shiftsValidity
  //   .filter(
  //     ({hasAvailableTimings, hasActiveAvailableTimings}) =>
  //       hasAvailableTimings && !hasActiveAvailableTimings
  //   )
  //   .map(({shift}) => shift);

  // if (inValidShifts.length) {
  //   return {
  //     isValid: false,
  //     error: `Please enter valid times or disable timings for the following shifts: ${inValidShifts
  //       .map((v) => v.name)
  //       .join(", ")}`,
  //   };
  // }

  return {isValid: true};
};

export const hasNameAndAtleastOneTiming = (shifts, opts = {}) => {
  const {overlapping = false} = opts;
  // If any shifts has an id then save button is not disabled
  return (
    shifts.every(({name}) => name) &&
    shifts.every((shift, shiftIndex) => {
      return (
        shift?.timings?.some(
          (timing, dayIndex) =>
            timing.isActive &&
            (overlapping || areShiftTimingsAvailable(shifts, shiftIndex, dayIndex)) &&
            timing.startTime &&
            timing.endTime
        ) || shift.id
      );
    })
  );
};

export const hasWindowNames = (shifts) => {
  // If any shifts has an id then save button is not disabled
  return shifts.every(({name}) => name);
};

export const isTimingAppliedToAll = (timings) => {
  const timingObj = timings.reduce(
    (acc, {isActive, startTime, endTime}) => ({
      ...acc,
      [`${isActive}${startTime}${endTime}`]: true,
    }),
    {}
  );
  return Object.keys(timingObj).length === 1;
};

export const handleApplySameTimeToAll = (
  applyTimingIndex,
  shifts,
  shiftIndex,
  overlapping = false
) => {
  const oldTimings = shifts[shiftIndex].timings;
  const timingToBeApplied = oldTimings[applyTimingIndex];

  return oldTimings.map((timing, dayIndex) => {
    if (!timing.isActive) {
      return {...timing};
    }
    if (!overlapping) {
      const shiftTimingsAvailable = areShiftTimingsAvailable(
        shifts,
        shiftIndex,
        dayIndex
      );

      if (!shiftTimingsAvailable) {
        return timing;
      }

      const isValidST = isValidStartTime(
        shifts,
        shiftIndex,
        dayIndex,
        timingToBeApplied.startTime,
        timingToBeApplied.endTime
      );
      const isValidET = isValidEndTime(
        shifts,
        shiftIndex,
        dayIndex,
        timingToBeApplied.endTime,
        timingToBeApplied.startTime
      );

      if (!isValidST || !isValidET) {
        return timing;
      }
    }

    return {
      ...timing,
      startTime: timingToBeApplied.startTime,
      endTime: timingToBeApplied.endTime,
      isActive: true,
      ...(timingToBeApplied?.zoneIds ? {zoneIds: timingToBeApplied.zoneIds} : {}),
      ...(timingToBeApplied?.zones ? {zones: timingToBeApplied.zones} : {}),
      ...(timingToBeApplied?.deliveryTimingSettings
        ? {
            deliveryTimingSettings: {
              ...timing.deliveryTimingSettings,
              maxStops: timingToBeApplied?.deliveryTimingSettings?.maxStops,
              serviceType: timingToBeApplied?.deliveryTimingSettings?.serviceType,
            },
          }
        : {}),
    };
  });
};
