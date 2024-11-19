import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import ShiftsTab from "../common/shifts-tab/shifts-tab";

const LocationShifts = (props) => {
  const {
    // State Values
    shifts,
    shiftIndex,
    shiftsError,
    selectedLocation,
    isShiftsCallInProgress,
    shiftsUpdateOrCreateError,
    selectedLocationShiftsData,
    // dispatch funcs
    resetShift,
    handleShiftChange,
    updateShiftTimings,
    updateOrCreateShift,
    hideShiftScreen,
    handleShiftTimingChange,
    handleShiftCheckboxClick,
  } = props;

  return (
    <>
      <div className="locations-card-header">
        <p>{`${selectedLocation.address} - Shifts`}</p>
        <FontAwesomeIcon icon={faTimes} onClick={hideShiftScreen} />
      </div>
      <div className="locations-card-content shifts-content">
        {isShiftsCallInProgress ? <BlockingLoader className="shifts-loader" /> : null}
        {shiftsError ? (
          <div>{shiftsError}</div>
        ) : selectedLocationShiftsData && selectedLocationShiftsData.shifts ? (
          <ShiftsTab
            overlapping
            shifts={shifts}
            shiftIndex={shiftIndex}
            location={selectedLocation}
            resetShift={resetShift}
            handleShiftChange={handleShiftChange}
            error={shiftsUpdateOrCreateError}
            updateOrCreateShift={updateOrCreateShift}
            updateShiftTimings={updateShiftTimings}
            handleShiftTimingChange={handleShiftTimingChange}
            handleShiftCheckboxClick={handleShiftCheckboxClick}
          />
        ) : null}
      </div>
    </>
  );
};

export default LocationShifts;
