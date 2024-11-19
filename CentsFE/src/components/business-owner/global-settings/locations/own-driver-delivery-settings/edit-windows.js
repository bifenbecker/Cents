import React, {useState, useEffect, useCallback} from "react";

import {ShiftTypes} from "../../../../../constants";
import {curateShiftsAndTimings} from "../utils/location";
import {
  hasWindowNames,
  validateAllShifts,
  filterShiftwithValidTimings,
} from "../common/shifts-tab/utils";
import {fetchShifts, updateShifts} from "../../../../../api/business-owner/locations";

import EditStep from "../common/edit-step/edit-step";
import Windows from "./forms/windows/windows";

const EditWindows = (props) => {
  const {location, hasZones, zones, closeEditDeliverySettingsScreen} = props;

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState();
  const [error, setError] = useState();

  const fetchWindows = useCallback(async () => {
    setLoading(true);
    setApiError();
    try {
      const res = await fetchShifts({
        storeId: location?.id,
        type: ShiftTypes.OWN_DELIVERY,
      });
      setShifts(
        curateShiftsAndTimings(res?.data?.shifts || [], {
          name: "Window",
          type: ShiftTypes.OWN_DELIVERY,
          addNewShift: !res?.data?.shifts?.length,
          overlapping: true,
        }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
      );
    } catch (error) {
      setApiError(
        error?.response?.data?.error || "Something went wrong while fetching Windows"
      );
    } finally {
      setLoading(false);
    }
  }, [location]);

  const validateAndSaveWindows = () => {
    const {isValid, error: errorMsg} = validateAllShifts(shifts, {overlapping: true});

    if (isValid) {
      setError();
      saveWindows();
    } else {
      setError(errorMsg);
    }
  };

  const saveWindows = async () => {
    setLoading(true);
    setError();

    try {
      await updateShifts(location?.id, filterShiftwithValidTimings(shifts));
      closeEditDeliverySettingsScreen();
    } catch (error) {
      setApiError(
        error?.response?.data?.error || "Something went wrong while saving Windows"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows();
  }, [fetchWindows]);

  return (
    <EditStep
      header="Pickup & Delivery Windows"
      isLoading={loading}
      errorMessage={error}
      onSubmit={validateAndSaveWindows}
      onCancel={closeEditDeliverySettingsScreen}
      isSaveDisabled={!hasWindowNames(shifts)}
      contentClassName="shifts-content"
    >
      <Windows
        formType="EDIT"
        hasZones={hasZones}
        zones={zones}
        shifts={shifts}
        setShifts={setShifts}
        location={location}
        apiError={apiError}
        setLoading={setLoading}
        setError={setError}
        showShiftTimeRangePicker
      />
    </EditStep>
  );
};

export default EditWindows;
