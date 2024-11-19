import React from "react";
import cx from "classnames";

import {WEEK_DAYS} from "./constants";
import {areShiftTimingsAvailable, handleApplySameTimeToAll} from "./utils";

import ShiftTimeRangePicker from "./shift-time-range-picker";
import ShiftTimePicker from "./shift-time-picker";
import Checkbox from "../../../../../commons/checkbox/checkbox";

const ShiftDays = (props) => {
  const {
    // state values
    shifts,
    shiftIndex,
    overlapping,
    showShiftTimeRangePicker = false,
    // dispatch funcs
    updateShiftTimings,
    handleShiftTimingChange,
    handleShiftCheckboxClick,
    asyncValidateTimeChange,
    // content
    DropdownRightContent,
  } = props;

  const shift = shifts[shiftIndex];

  if (!shift || !shift.timings) {
    return null;
  }

  const canShowApplyToAll = (timing, dayIdx) => {
    const isFirstActiveTiming =
      dayIdx === shift?.timings.findIndex((timing) => timing?.isActive);
    return isFirstActiveTiming && timing.startTime && timing.endTime;
  };

  const handleApplyToAll = (applyTimingIndex) => {
    const newTimings = handleApplySameTimeToAll(
      applyTimingIndex,
      shifts,
      shiftIndex,
      overlapping
    );
    updateShiftTimings(shiftIndex, newTimings);
  };

  return (
    <>
      {shift.timings.map((timing, index) => {
        const shiftTimingsAvailable =
          overlapping || areShiftTimingsAvailable(shifts, shiftIndex, index);
        return (
          <div className="shift-timing-item" key={`${timing.day}-${index}`}>
            <Checkbox
              checked={timing.isActive}
              onChange={() => handleShiftCheckboxClick(shiftIndex, index)}
              disabled={!shiftTimingsAvailable}
            />
            <span className="day">{WEEK_DAYS[timing.day]}</span>
            {shiftTimingsAvailable ? (
              <>
                {timing.isActive ? (
                  <div
                    className={cx(
                      "dropdowns-container-wrapper",
                      DropdownRightContent && "container-with-right-content"
                    )}
                  >
                    {showShiftTimeRangePicker ? (
                      <ShiftTimeRangePicker
                        shifts={shifts}
                        shiftIndex={shiftIndex}
                        timing={timing}
                        dayIndex={index}
                        overlapping={overlapping}
                        handleShiftTimingChange={handleShiftTimingChange}
                        asyncValidateTimeChange={asyncValidateTimeChange}
                        label="Start Time - End Time"
                        value={timing?.startTime || ""}
                        className={"time-range-picker-wrapper"}
                        isWrappedComponent
                      />
                    ) : (
                      <ShiftTimePicker
                        shifts={shifts}
                        shiftIndex={shiftIndex}
                        timing={timing}
                        dayIndex={index}
                        overlapping={overlapping}
                        handleShiftTimingChange={handleShiftTimingChange}
                        asyncValidateTimeChange={asyncValidateTimeChange}
                      />
                    )}
                    {DropdownRightContent ? (
                      <DropdownRightContent
                        shift={shift}
                        shiftIndex={shiftIndex}
                        dayIndex={index}
                        timing={timing}
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="no-shifts-message">No available times to select</p>
            )}

            {canShowApplyToAll(timing, index) ? (
              <span
                onClick={() => handleApplyToAll(index)}
                className={cx("apply-to-all-button", DropdownRightContent && "shrink")}
              >
                Apply to all
              </span>
            ) : (
              <span className="apply-to-all-button spacer">Apply to all</span>
            )}
          </div>
        );
      })}
    </>
  );
};

export default ShiftDays;
