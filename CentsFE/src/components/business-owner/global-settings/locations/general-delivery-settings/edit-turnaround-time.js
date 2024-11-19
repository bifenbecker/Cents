import React, {useState} from "react";

import {MaxTurnAroundTime} from "../constants";
import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import TurnaroundTime from "./forms/turnaround-time";

const EditTurnaroundTime = (props) => {
  const {closeEditDeliverySettingsScreen, turnAroundInHours = "", storeId = null} = props;
  const [updatedTurnAroundInHours, setUpdatedTurnAroundInHours] = useState(
    turnAroundInHours
  );
  const [error, setError] = useState("");
  const [updateInProgress, setUpdateInProgress] = useState(false);
  // Updates turnaround time
  const editTurnAroundTime = async () => {
    try {
      if (updatedTurnAroundInHours > MaxTurnAroundTime) {
        setError("Please enter a number not more than 168.");
        return;
      }
      setUpdateInProgress(true);
      await updateDeliverySettings(storeId, {
        turnAroundInHours: updatedTurnAroundInHours,
      });
      setUpdateInProgress(false);
      closeEditDeliverySettingsScreen();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the turnaround time. Please try again later!"
      );
      setUpdateInProgress(false);
    }
  };
  return (
    <EditStep
      header="Turnaround Time"
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={editTurnAroundTime}
      isSaveDisabled={!updatedTurnAroundInHours}
      isLoading={updateInProgress}
      errorMessage={error}
    >
      <TurnaroundTime
        selectedTime={updatedTurnAroundInHours}
        setTurnAroundTime={(time) => setUpdatedTurnAroundInHours(time)}
        resetError={() => setError()}
      />
    </EditStep>
  );
};

export default EditTurnaroundTime;
