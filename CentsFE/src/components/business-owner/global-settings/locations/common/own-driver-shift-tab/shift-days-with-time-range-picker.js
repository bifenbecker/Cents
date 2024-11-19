import React from "react";
import cx from "classnames";

import {WEEK_DAYS} from "../shifts-tab/constants";
import {areShiftTimingsAvailable, handleApplySameTimeToAll} from "../shifts-tab/utils";

import Checkbox from "../../../../../commons/checkbox/checkbox";
import MaxStopsDropdown from "../../../../../commons/max-stops-dropdown/max-stops-dropdown";
import PickupDeliveryDropdown from "../../../../../commons/pickup-delivery-dropdown/pickup-delivery-dropdown";
import ShiftTimeRangePicker from "../shifts-tab/shift-time-range-picker";

const ShiftDaysWithTimeRangePicker = (props) => {
  const {
    // state values
    shifts,
    shiftIndex,
    overlapping,
    // dispatch funcs
    updateShiftTimings,
    handleShiftTimingChange,
    handleDeliveryTimingSettingsChange,
    handleShiftCheckboxClick,
    asyncValidateTimeChange,
    // content
    DropdownRightContent,
  } = props;

  const shift = shifts[shiftIndex];

  if (!shift || !shift.timings) {
    return null;
  }

  const showApplyToAll = (timing, dayIdx) => {
    return (
      timing?.startTime &&
      timing?.endTime &&
      dayIdx === shift?.timings?.findIndex((timing) => timing?.isActive)
    );
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
          <div className="own-driver-shift-timing-item" key={`${timing.day}-${index}`}>
            <div className="day-checkbox">
              <Checkbox
                checked={timing.isActive}
                onChange={() => handleShiftCheckboxClick(shiftIndex, index)}
                disabled={!shiftTimingsAvailable}
              />
              <span className="day">{WEEK_DAYS[timing.day]}</span>
            </div>

            {shiftTimingsAvailable ? (
              <>
                {timing.isActive ? (
                  <>
                    <div className="new-dropdown-container-wrapper">
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

                      <MaxStopsDropdown
                        maxStops={timing?.deliveryTimingSettings?.maxStops}
                        key={`${shiftIndex}-${index}`}
                        onMaxStopsChange={(value) =>
                          handleDeliveryTimingSettingsChange(
                            shiftIndex,
                            index,
                            "maxStops",
                            value
                          )
                        }
                      />
                      {DropdownRightContent ? (
                        <DropdownRightContent
                          shift={shift}
                          shiftIndex={shiftIndex}
                          dayIndex={index}
                          timing={timing}
                        />
                      ) : null}
                      <PickupDeliveryDropdown
                        serviceType={timing?.deliveryTimingSettings?.serviceType}
                        onServiceTypeChange={(value) =>
                          handleDeliveryTimingSettingsChange(
                            shiftIndex,
                            index,
                            "serviceType",
                            value
                          )
                        }
                      />
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <p className="no-shifts-message">No time slots available</p>
            )}

            {showApplyToAll(timing, index) ? (
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

export default ShiftDaysWithTimeRangePicker;
