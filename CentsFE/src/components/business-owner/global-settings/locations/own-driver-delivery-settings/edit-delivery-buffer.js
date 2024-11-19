import React, {useState} from "react";

import {MaxBufferTime} from "../constants.js";
import {updateOwnDriverDeliverySettings} from "../../../../../api/business-owner/delivery-settings.js";

import EditStep from "../common/edit-step/edit-step.js";
import Buffer from "./forms/buffer";

const EditDeliveryBuffer = ({
  closeEditDeliverySettingsScreen,
  deliveryBufferInHours = "",
  storeId = null,
}) => {
  const [updatedDeliveryBufferTimeInHours, setDeliveryBufferTimeInHours] = useState(
    deliveryBufferInHours
  );
  const [error, setError] = useState("");
  const [updateInProgress, setUpdateInProgress] = useState(false);
  // Updates buffer time
  const editBufferTime = async () => {
    try {
      if (isNaN(updatedDeliveryBufferTimeInHours)) {
        setError("Please enter a valid number.");
        return;
      }
      if (updatedDeliveryBufferTimeInHours > MaxBufferTime) {
        setError("Please enter a number not more than 168.");
        return;
      }
      setUpdateInProgress(true);
      await updateOwnDriverDeliverySettings(storeId, {
        deliveryWindowBufferInHours: Number(updatedDeliveryBufferTimeInHours),
      });
      setUpdateInProgress(false);
      closeEditDeliverySettingsScreen();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the buffer time. Please try again later!"
      );
      setUpdateInProgress(false);
    }
  };
  return (
    <EditStep
      header="Pickup/Delivery Buffer"
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={editBufferTime}
      isSaveDisabled={!updatedDeliveryBufferTimeInHours}
      isLoading={updateInProgress}
      errorMessage={error}
    >
      <Buffer
        selectedTime={updatedDeliveryBufferTimeInHours}
        setDeliveryBufferTime={setDeliveryBufferTimeInHours}
        resetError={setError}
      />
    </EditStep>
  );
};

export default EditDeliveryBuffer;
