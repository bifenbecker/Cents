import React from "react";
import PropTypes from "prop-types";

import {areShiftTimingsAvailable} from "./utils";

import TabBar from "../../../../../commons/tab-bar/tabBar";
import TextField from "../../../../../commons/textField/textField";
import ShiftDays from "./shift-days";
import ShiftDaysWithTimeRangePicker from "../own-driver-shift-tab/shift-days-with-time-range-picker";

const ShiftsTab = (props) => {
  const {
    shifts,
    shiftIndex,
    shiftNameLabel,
    location,
    overlapping,
    resetShift,
    handleShiftChange,
    handleRemoveShift,
    handleShiftNameChange,
    showAddNewButton,
    onAddNewClick,
    error,
    updateOrCreateShift,
    updateShiftTimings,
    handleShiftTimingChange,
    handleShiftCheckboxClick,
    removeTabConfirmationMessage,
    asyncValidateTimeChange,
    showShiftTimeRangePicker,
    showOwnDriverShifts,
    handleDeliveryTimingSettingsChange,
    // content
    DropdownRightContent,
  } = props;

  const shift = shifts[shiftIndex];

  if (!shift || !shift.timings) {
    return null;
  }

  const isValidShiftTimings = () => {
    return (
      // Check if there are any timings which has id or which are active.
      shift?.timings?.filter((timing) => timing.id || timing.isActive).length &&
      // Check if the active shifts with available timings has startTime and endTime
      shift?.timings
        ?.filter(
          (timing, dayIndex) =>
            timing.isActive &&
            (overlapping || areShiftTimingsAvailable(shifts, shiftIndex, dayIndex))
        )
        ?.every((timing) => timing.startTime && timing.endTime)
    );
  };

  const onShiftNameChange = (event) => {
    handleShiftNameChange(shiftIndex, event?.target?.value);
  };

  const onShiftNameBlur = () => {
    handleShiftNameChange(shiftIndex, shift?.name?.trim() || "");
  };

  return (
    <>
      <TabBar
        showAddNewButton={showAddNewButton}
        onAddNewClick={() => {
          if (onAddNewClick) onAddNewClick();
        }}
        tabs={shifts.map((shift) => shift.name)}
        activeIndex={shiftIndex}
        tabChangeHandler={(nextIndex) => {
          if (resetShift) {
            resetShift(shiftIndex);
          }
          handleShiftChange(nextIndex);
        }}
        tabRemoveHandler={handleRemoveShift}
        removeTabConfirmationMessage={removeTabConfirmationMessage}
        label={"+ Add a Window"}
      />

      {handleShiftNameChange ? (
        <TextField
          label={shiftNameLabel}
          onChange={onShiftNameChange}
          onBlur={onShiftNameBlur}
          value={shift?.name || ""}
          maxLength="20"
          className="edit-shift-name-input"
          error={!shift?.name}
        />
      ) : null}

      {showOwnDriverShifts ? (
        <ShiftDaysWithTimeRangePicker
          shifts={shifts}
          shiftIndex={shiftIndex}
          overlapping={overlapping}
          updateShiftTimings={updateShiftTimings}
          handleShiftTimingChange={handleShiftTimingChange}
          handleDeliveryTimingSettingsChange={handleDeliveryTimingSettingsChange}
          handleShiftCheckboxClick={handleShiftCheckboxClick}
          DropdownRightContent={DropdownRightContent}
          asyncValidateTimeChange={asyncValidateTimeChange}
        />
      ) : (
        <ShiftDays
          shifts={shifts}
          shiftIndex={shiftIndex}
          overlapping={overlapping}
          updateShiftTimings={updateShiftTimings}
          handleShiftTimingChange={handleShiftTimingChange}
          handleShiftCheckboxClick={handleShiftCheckboxClick}
          DropdownRightContent={DropdownRightContent}
          asyncValidateTimeChange={asyncValidateTimeChange}
          showShiftTimeRangePicker={showShiftTimeRangePicker}
        />
      )}

      {error ? <p className="error-message">{error}</p> : null}

      {updateOrCreateShift && (
        <button
          disabled={!isValidShiftTimings()}
          className="btn-theme btn-rounded save-button"
          onClick={() => {
            updateOrCreateShift(shift, location.id);
          }}
        >
          SAVE
        </button>
      )}
    </>
  );
};

ShiftsTab.propTypes = {
  shifts: PropTypes.arrayOf(PropTypes.object).isRequired,
  shiftIndex: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  resetShift: PropTypes.func,
  handleRemoveShift: PropTypes.func,
  handleShiftChange: PropTypes.func.isRequired,
  overlapping: PropTypes.bool,
  showAddNewButton: PropTypes.bool,
  onAddNewClick: PropTypes.func,
  error: PropTypes.string,
  removeTabConfirmationMessage: PropTypes.string,
  updateOrCreateShift: PropTypes.func,
  updateShiftTimings: PropTypes.func.isRequired,
  handleShiftTimingChange: PropTypes.func.isRequired,
  handleShiftCheckboxClick: PropTypes.func.isRequired,
  DropdownRightContent: PropTypes.any,
};

ShiftsTab.defaultProps = {
  showAddNewButton: false,
  error: "",
  updateOrCreateShift: undefined,
  resetShift: undefined,
  handleRemoveShift: undefined,
  removeTabConfirmationMessage: "Are you sure you want to remove this shift?",
  overlapping: false,
  shiftNameLabel: "Shift Name",
  DropdownRightContent: undefined,
};

export default ShiftsTab;
