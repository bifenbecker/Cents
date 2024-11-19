import React, {useState, useEffect} from "react";
import pick from "lodash/pick";

import {
  isTimingAppliedToAll,
  handleApplySameTimeToAll,
} from "../../../common/shifts-tab/utils";
import {validateTimings} from "../../../../../../../api/business-owner/locations";

import Checkbox from "../../../../../../commons/checkbox/checkbox.js";
import ShiftTimePicker from "../../../common/shifts-tab/shift-time-picker";
import ShiftDays from "../../../common/shifts-tab/shift-days";
import {ShiftTypes} from "../../../../../../../constants";

const PickUpDropOffHours = ({shifts, setShifts, storeId, setError, setLoading}) => {
  const [shiftIndex, setShiftIndex] = useState(0);
  const [showShiftDaySelection, setShowShiftDaySelection] = useState(false);

  useEffect(() => {
    setShowShiftDaySelection(!isTimingAppliedToAll(shifts[0].timings));
  }, [shifts]);

  const handleValidateTimings = async (payload) => {
    try {
      setLoading(true);
      await validateTimings(storeId, {
        ...payload,
        timing: pick(payload.timing, ["isActive", "startTime", "endTime"]),
        type: ShiftTypes.CENTS_DELIVERY,
      });
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.error);
      setLoading(false);
      return false;
    }
  };
  const handleShiftTimingChange = async (shiftIdx, dayIndex, key, value) => {
    setError();
    setShifts((state) => {
      const newShifts = [...state];
      newShifts[shiftIdx].timings[dayIndex][key] = value;
      return newShifts;
    });
  };

  const handleShiftTimingPickerChange = async (shiftIdx, _dayIndex, key, value) => {
    setError();
    let isValid = true;
    if (shifts[shiftIdx].timings[_dayIndex].id) {
      isValid = await handleValidateTimings({
        timingIds: [shifts[shiftIdx].timings[_dayIndex].id],
        timing: {...shifts[shiftIdx].timings[_dayIndex], [key]: value},
      });
    }
    if (isValid) {
      setShifts((state) => {
        const newShifts = [...state];
        newShifts[shiftIdx].timings.forEach((item) => {
          newShifts[shiftIdx].timings[item.day].isActive = true;
          newShifts[shiftIdx].timings[item.day][key] = value;
        });
        return newShifts;
      });
    }
  };

  const handleShiftCheckboxClick = async (shiftIdx, dayIndex) => {
    setError();
    let isValid = true;
    if (
      shifts[shiftIdx].timings[dayIndex].id &&
      shifts[shiftIdx].timings[dayIndex].isActive
    ) {
      isValid = await handleValidateTimings({
        timingIds: [shifts[shiftIdx].timings[dayIndex].id],
        timing: {...shifts[shiftIdx].timings[dayIndex], isActive: false},
      });
    }
    if (isValid) {
      setShifts((state) => {
        const newShifts = [...state];

        newShifts[shiftIdx].timings[dayIndex].isActive = !newShifts[shiftIdx].timings[
          dayIndex
        ].isActive;
        return newShifts;
      });
    }
  };

  const updateShiftTimings = async (shiftIdx, newTimings) => {
    setError();
    let activeTimings = newTimings.filter((timing) => timing.isActive && timing.id);
    let isValid = true;
    setShowShiftDaySelection(false);
    if (activeTimings.length) {
      isValid = await handleValidateTimings({
        timingIds: activeTimings.map((timing) => timing.id),
        timing: {...activeTimings[0]},
      });
    }
    if (isValid) {
      setShifts((state) => {
        const newShifts = [...state];
        newShifts[shiftIdx].timings = newTimings;
        return newShifts;
      });
    }
  };
  const handleShiftDaySelection = () => {
    setError();
    if (showShiftDaySelection) {
      // User wants to apply same time to all shifts
      const applyTimingIndex = shifts[shiftIndex]?.timings.findIndex(
        (timing) => timing?.isActive && timing?.startTime && timing?.endTime
      );
      if (applyTimingIndex > -1) {
        const newTimings = handleApplySameTimeToAll(
          applyTimingIndex,
          shifts,
          shiftIndex,
          true
        );
        updateShiftTimings(shiftIndex, newTimings);
      } else {
        setError("Please pick at least one timing to apply to all days.");
        return;
      }
    }
    setShowShiftDaySelection(!showShiftDaySelection);
  };
  const validateTimeChange = (shiftIdx, dayIndex, key, value) => {
    return shifts[shiftIdx].timings[dayIndex].id
      ? handleValidateTimings({
          timingIds: [shifts[shiftIdx].timings[dayIndex].id],
          timing: {...shifts[shiftIdx].timings[dayIndex], [key]: value},
        })
      : true;
  };

  return (
    <div className="pick-up-drop-off-hours__container">
      <div className="pick-up-drop-off-hours__header">
        <p>
          <b>
            Which hours are you open for delivery drivers <br />
            to pickup and dropoff orders?
          </b>
        </p>
      </div>
      {showShiftDaySelection ? (
        <div className="pick-up-drop-off-hours__radio-container">
          <Checkbox checked={showShiftDaySelection} onChange={handleShiftDaySelection} />
          <p className="pick-up-drop-off-hours__set-radio-text">
            Set different pickup {"&"} drop off hours for each day
          </p>
        </div>
      ) : null}
      {!showShiftDaySelection ? (
        <div className="pick-up-drop-off-hours__timing-container">
          <p className="pick-up-drop-off-hours__label">Sunday - Saturday:</p>
          <div className="pick-up-drop-off-hours__shift-timing shifts-content shift-timing-item">
            <ShiftTimePicker
              overlapping
              shifts={shifts}
              shiftIndex={shiftIndex}
              timing={shifts[0].timings[0]}
              dayIndex={0}
              handleShiftTimingChange={handleShiftTimingPickerChange}
              asyncValidateTimeChange={validateTimeChange}
            />
          </div>
        </div>
      ) : (
        <div className="day-slection-popup">
          <div className="shifts">
            <ShiftDays
              overlapping
              shifts={shifts}
              shiftIndex={shiftIndex}
              asyncValidateTimeChange={validateTimeChange}
              handleShiftChange={(shiftIdx) => setShiftIndex(shiftIdx)}
              updateShiftTimings={updateShiftTimings}
              handleShiftTimingChange={handleShiftTimingChange}
              handleShiftCheckboxClick={handleShiftCheckboxClick}
            />
          </div>
        </div>
      )}
      {!showShiftDaySelection ? (
        <div className="pick-up-drop-off-hours__radio-container">
          <Checkbox checked={showShiftDaySelection} onChange={handleShiftDaySelection} />
          <p className="pick-up-drop-off-hours__set-radio-text">
            Set different pickup {"&"} drop off hours for each day
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default PickUpDropOffHours;
