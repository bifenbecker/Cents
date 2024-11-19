import React from "react";

import {SHORT_WEEK_DAYS} from "./constants";
import {
  getMaxTimeForStartTime,
  getMinTimeForStartTime,
  getMinTimeForEndTime,
  getMaxTimeForEndTime,
} from "./utils";

import TimePickerWithInput from "../../../../../commons/time-picker/time-picker-with-input";

const ShiftTimePicker = (props) => {
  const {
    shifts,
    shiftIndex,
    timing,
    dayIndex,
    overlapping,
    handleShiftTimingChange,
    isDisabled,
    asyncValidateTimeChange,
  } = props;

  return (
    <div className="dropdowns-container">
      <TimePickerWithInput
        small
        required
        includeMinTime
        fallbackOnError
        disabled={isDisabled}
        includeMaxTime={!timing.endTime}
        key={`${shiftIndex}-${dayIndex}-start`}
        label="Starts"
        asyncValidateTimeChange={
          asyncValidateTimeChange
            ? async (value) => {
                return await asyncValidateTimeChange(
                  shiftIndex,
                  dayIndex,
                  "startTime",
                  value
                );
              }
            : undefined
        }
        onChange={(value) => {
          handleShiftTimingChange(shiftIndex, dayIndex, "startTime", value);
        }}
        value={timing.startTime}
        minTime={
          overlapping
            ? new Date(0).toISOString()
            : getMinTimeForStartTime(shifts, shiftIndex, dayIndex)
        }
        maxTime={
          overlapping
            ? timing.endTime
            : getMaxTimeForStartTime(shifts, shiftIndex, dayIndex)
        }
        nextDayLabel={
          SHORT_WEEK_DAYS[Number(timing.day) === 6 ? 0 : Number(timing.day) + 1]
        }
        timezone="UTC"
      />
      <span className="separator ml-1 mr-1">{"-"}</span>
      <TimePickerWithInput
        small
        required
        fallbackOnError
        disabled={!timing.startTime}
        includeMinTime={!timing.startTime}
        includeMaxTime
        key={`${shiftIndex}-${dayIndex}-end`}
        label="Ends"
        asyncValidateTimeChange={
          asyncValidateTimeChange
            ? async (value) => {
                return await asyncValidateTimeChange(
                  shiftIndex,
                  dayIndex,
                  "endTime",
                  value
                );
              }
            : undefined
        }
        onChange={(value) => {
          handleShiftTimingChange(shiftIndex, dayIndex, "endTime", value);
        }}
        value={timing.endTime}
        minTime={
          overlapping
            ? timing.startTime
            : getMinTimeForEndTime(shifts, shiftIndex, dayIndex)
        }
        {...(overlapping
          ? {}
          : {maxTime: getMaxTimeForEndTime(shifts, shiftIndex, dayIndex)})}
        nextDayLabel={
          SHORT_WEEK_DAYS[Number(timing.day) === 6 ? 0 : Number(timing.day) + 1]
        }
        timezone="UTC"
      />
    </div>
  );
};

export default ShiftTimePicker;
