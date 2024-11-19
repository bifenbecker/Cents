import React, {useState} from "react";

import {SHORT_WEEK_DAYS} from "./constants";
import {
  getMaxTimeForStartTime,
  getMinTimeForStartTime,
  getMinTimeForEndTime,
  getMaxTimeForEndTime,
} from "./utils";

import MaterialWrapper from "../../../../../commons/material-input-wrapper/materialInputWrapper";
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
    isWrappedComponent,
    updateMaterialWrapperFocus,
  } = props;

  const [forceOpenEndTimeMenu, setForceOpenEndTimeMenu] = useState(false);

  return (
    <div className="dropdowns-container time-range-container">
      <TimePickerWithInput
        small
        required
        includeMinTime
        fallbackOnError
        disabled={isDisabled}
        includeMaxTime={!timing.endTime}
        key={`${shiftIndex}-${dayIndex}-start`}
        label=""
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
            : null
        }
        onChange={(value, type) => {
          if (type === "setDefaultEndTime") {
            handleShiftTimingChange(shiftIndex, dayIndex, "endTime", value);
            setForceOpenEndTimeMenu(true);
          } else {
            handleShiftTimingChange(shiftIndex, dayIndex, "startTime", value);
          }
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
        isWrappedComponent={isWrappedComponent}
        inputFieldClassName={"time-range-picker-input"}
        updateMaterialWrapperFocus={updateMaterialWrapperFocus}
        timing={timing}
        dropdownContainerLabel="Start Time"
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
        label=""
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
            : null
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
        inputFieldClassName={"time-range-picker-input"}
        isWrappedComponent={isWrappedComponent}
        updateMaterialWrapperFocus={updateMaterialWrapperFocus}
        timing={timing}
        dropdownContainerLabel="End Time"
        forceOpenMenu={forceOpenEndTimeMenu}
        setForceOpenMenu={setForceOpenEndTimeMenu}
      />
    </div>
  );
};

export default MaterialWrapper(ShiftTimePicker, {type: "TIME_RANGE"});
