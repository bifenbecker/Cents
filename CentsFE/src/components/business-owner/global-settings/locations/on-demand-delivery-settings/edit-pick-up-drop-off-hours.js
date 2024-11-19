import React, {useState, useEffect} from "react";

import {ShiftTypes} from "../../../../../constants";
import {
  validateAllShifts,
  filterOnDemandShiftsData,
  hasWindowNames,
} from "../common/shifts-tab/utils";
import {curateShiftsAndTimings} from "../utils/location";
import {fetchShifts, updateShifts} from "../../../../../api/business-owner/locations";

import EditStep from "../common/edit-step/edit-step";
import PickUpDropOffHours from "./forms/pick-up-drop-off-hours/pick-up-drop-off-hours";

const EditPickUpDropOffHours = ({storeId, closeEditDeliverySettingsScreen}) => {
  const [shifts, setShifts] = useState(
    curateShiftsAndTimings([], {
      name: "Window",
      addNewShift: true,
      type: ShiftTypes.CENTS_DELIVERY,
      overlapping: true,
    }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true);
    setError();
    fetchShifts({storeId, type: ShiftTypes.CENTS_DELIVERY})
      .then((res) => {
        setShifts(
          curateShiftsAndTimings(res?.data?.shifts || [], {
            name: "Window",
            type: ShiftTypes.CENTS_DELIVERY,
            addNewShift: !res?.data?.shifts?.length,
          }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
        );
      })
      .catch((error) => {
        setError(error?.response?.data?.error, "Could not update Pick & Dropoff Hours");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [storeId]);

  const updatePickUpDropOffHours = () => {
    setLoading(true);
    setError();
    updateShifts(storeId, filterOnDemandShiftsData(shifts))
      .then(({data: {success}}) => {
        setLoading(false);
        success && closeEditDeliverySettingsScreen();
      })
      .catch((error) => {
        setError(error?.response?.data?.error, "Could not update Pick & Dropoff Hours");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const validateAndUpdateShifts = () => {
    const {isValid, error: errorMsg} = validateAllShifts(shifts, {overlapping: true});

    if (isValid) {
      setError();
      updatePickUpDropOffHours();
    } else {
      setError(errorMsg);
    }
  };

  return (
    <EditStep
      header="Pickup & Dropoff Hours"
      isLoading={loading}
      errorMessage={error}
      onSubmit={validateAndUpdateShifts}
      onCancel={closeEditDeliverySettingsScreen}
      isSaveDisabled={!hasWindowNames(shifts)}
      contentClassName="shifts-content pickup-dropoff-card-content"
    >
      <PickUpDropOffHours
        shifts={shifts}
        setShifts={setShifts}
        storeId={storeId}
        setError={(error) => setError(error)}
        setLoading={setLoading}
      />
    </EditStep>
  );
};

export default EditPickUpDropOffHours;
