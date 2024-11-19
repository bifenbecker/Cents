import React, {useState, useCallback, useMemo, useEffect} from "react";
import pick from "lodash/pick";
import map from "lodash/map";

import {curateShiftsAndTimings} from "../../../utils/location";
import {ShiftTypes} from "../../../../../../../constants";

import MultiSelectWithInput from "../../../../../../commons/multi-select-with-input/multi-select-with-input";
import {validateTimings} from "../../../../../../../api/business-owner/locations";
import ShiftsTab from "../../../common/shifts-tab/shifts-tab";

const ZonesSelectionDropdown = ({
  shiftIndex,
  dayIndex,
  timing,
  zones,
  handleZonesChange,
  formType,
  setDefaultZones,
}) => {
  const timingZonesKey = useMemo(() => (formType === "NEW" ? "zones" : "zoneIds"), [
    formType,
  ]);
  // If it is a new timing then assign all zones by default unless manually updated.
  useEffect(() => {
    if (
      !timing.startTime &&
      !timing.endTime &&
      (!timing[timingZonesKey] ||
        (!timing.zonesManuallyUpdated && timing[timingZonesKey]?.length !== zones.length))
    ) {
      setDefaultZones(
        shiftIndex,
        dayIndex,
        map(zones, formType === "NEW" ? "name" : "id")
      );
    }
  }, [zones, timing, dayIndex, formType, shiftIndex, timingZonesKey, setDefaultZones]);

  return (
    <MultiSelectWithInput
      label="Zones"
      allItemsLabel="All zones"
      itemName="zone(s)"
      options={
        zones?.map(({id, name}) => ({
          label: name,
          value: formType === "NEW" ? name : id,
        })) || []
      }
      value={timing?.[timingZonesKey] || []}
      onChange={(value) => {
        handleZonesChange(shiftIndex, dayIndex, value);
      }}
      className="zones-multi-select-dropdown"
    />
  );
};

const Windows = (props) => {
  const {
    formType = "NEW",
    shifts,
    setShifts,
    location,
    apiError,
    hasZones,
    zones,
    setLoading,
    setError,
    showShiftTimeRangePicker,
  } = props;

  const [shiftIndex, setShiftIndex] = useState(0);
  const timingZonesKey = useMemo(() => (formType === "NEW" ? "zones" : "zoneIds"), [
    formType,
  ]);

  const handleValidateTimings = async (payload) => {
    try {
      setLoading(true);
      await validateTimings(location?.id, {
        ...payload,
        timing: pick(payload.timing, ["isActive", "startTime", "endTime"]),
        type: ShiftTypes.OWN_DELIVERY,
      });
      setLoading(false);
      return true;
    } catch (e) {
      setError(e?.response?.data?.error);
      setLoading(false);
      return false;
    }
  };

  const addNewShift = () => {
    setShifts((state) =>
      curateShiftsAndTimings(state, {
        name: "Window",
        addNewShift: true,
        type: ShiftTypes.OWN_DELIVERY,
        overlapping: true,
      }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
    );
    // This would be the last shift that's recently added.
    setShiftIndex(shifts.length);
  };

  const handleShiftDetailsChange = async (shiftIdx, key, value) => {
    setError();
    let isValid = true;
    let activeTimings = shifts[shiftIdx]?.timings.filter(
      (timing) => timing.isActive && timing.id
    );
    if (activeTimings?.length && key === "timings") {
      isValid = await handleValidateTimings({
        timingIds: activeTimings.map((timing) => timing.id),
        timing: {...activeTimings?.[0]},
      });
    }
    if (isValid) {
      setShifts((state) => {
        const newShifts = [...state];
        newShifts[shiftIdx][key] = value;
        return newShifts;
      });
    }
  };

  const handleShiftNameChange = (shiftIdx, value) => {
    handleShiftDetailsChange(shiftIdx, "name", value);
  };

  const updateShiftTimings = (shiftIdx, value) => {
    handleShiftDetailsChange(shiftIdx, "timings", value);
  };

  const handleSingleShiftTimingChange = useCallback(
    async (shiftIdx, dayIndex, key, value) => {
      setError();
      setShifts((state) => {
        const newShifts = [...state];
        newShifts[shiftIdx].timings[dayIndex][key] = value;
        return newShifts;
      });
    },
    [setShifts, setError]
  );

  const handleDeliveryTimingSettingsChange = useCallback(
    (shiftIdx, dayIndex, key, value) => {
      setError();
      setShifts((state) => {
        const newShifts = [...state];

        if (newShifts[shiftIdx]?.timings[dayIndex]?.deliveryTimingSettings) {
          newShifts[shiftIdx].timings[dayIndex].deliveryTimingSettings[key] = value;
        }
        return newShifts;
      });
    }
  );

  const handleZonesChange = useCallback(
    (shiftIdx, dayIndex, value) => {
      setError();
      setShifts((state) => {
        const newShifts = [...state];

        newShifts[shiftIdx].timings[dayIndex][timingZonesKey] = value;
        newShifts[shiftIdx].timings[dayIndex]["zonesManuallyUpdated"] = true;
        return newShifts;
      });
    },
    [setError, setShifts, timingZonesKey]
  );

  const setDefaultZones = useCallback(
    (shiftIdx, dayIndex, value) => {
      setShifts((state) => {
        const newShifts = [...state];

        newShifts[shiftIdx].timings[dayIndex][timingZonesKey] = value;
        return newShifts;
      });
    },
    [setShifts, timingZonesKey]
  );

  const MemoisedZonesDropdown = React.useCallback(
    ({shiftIndex, dayIndex, timing}) => {
      return (
        <ZonesSelectionDropdown
          {...{
            shiftIndex,
            dayIndex,
            timing,
            handleZonesChange,
            setDefaultZones,
            zones,
            formType,
            timingZonesKey,
          }}
        />
      );
    },
    [handleZonesChange, zones, formType, timingZonesKey, setDefaultZones]
  );

  const handleShiftCheckboxClick = async (shiftIdx, dayIndex) => {
    let isValid = true;
    if (
      shifts[shiftIdx]?.timings[dayIndex]?.id &&
      shifts[shiftIdx]?.timings[dayIndex]?.isActive
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

  const validateTimeChange = (shiftIdx, dayIndex, key, value) => {
    return shifts[shiftIdx].timings[dayIndex].id
      ? handleValidateTimings({
          timingIds: [shifts[shiftIdx].timings[dayIndex].id],
          timing: {...shifts[shiftIdx].timings[dayIndex], [key]: value},
        })
      : true;
  };

  return (
    <div className="windows-container">
      <span className="sub-header">
        Please enter the window(s) of time when your drivers will be picking up and
        delivering orders
      </span>
      {apiError ? (
        <div className="error-message m-auto">{apiError}</div>
      ) : (
        <ShiftsTab
          overlapping
          showAddNewButton
          shiftNameLabel="Window Name"
          onAddNewClick={addNewShift}
          shifts={shifts}
          asyncValidateTimeChange={validateTimeChange}
          shiftIndex={shiftIndex}
          location={location}
          handleShiftChange={(shiftIdx) => setShiftIndex(shiftIdx)}
          updateShiftTimings={updateShiftTimings}
          handleShiftTimingChange={handleSingleShiftTimingChange}
          handleDeliveryTimingSettingsChange={handleDeliveryTimingSettingsChange}
          DropdownRightContent={hasZones ? MemoisedZonesDropdown : undefined}
          handleShiftCheckboxClick={handleShiftCheckboxClick}
          handleShiftNameChange={handleShiftNameChange}
          removeTabConfirmationMessage="Are you sure you want to remove this pickup & delivery window?"
          showShiftTimeRangePicker={showShiftTimeRangePicker}
          showOwnDriverShifts
        />
      )}
    </div>
  );
};

export default Windows;
