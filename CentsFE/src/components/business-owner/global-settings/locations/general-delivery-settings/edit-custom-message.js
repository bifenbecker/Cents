import React, {useState} from "react";

import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import CustomMessage from "./forms/custom-message/CustomMessage.js";

const EditCustomMessage = (props) => {
  const {
    closeEditDeliverySettingsScreen,
    customHeader = null,
    customMessage = null,
    storeId = null,
  } = props;

  const [updatedCustomHeader, setUpdatedCustomHeader] = useState(customHeader);
  const [updatedCustomMessage, setUpdatedCustomMessage] = useState(customMessage);
  const [error, setError] = useState();
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [customMessageError, setCustomMessageError] = useState("");

  // Updates custom message
  const editCustomMessage = async () => {
    try {
      setError();
      setUpdateInProgress(true);
      await updateDeliverySettings(storeId, {
        customLiveLinkHeader: updatedCustomHeader,
        customLiveLinkMessage: updatedCustomMessage,
      });
      setUpdateInProgress(false);
      closeEditDeliverySettingsScreen();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Could not update the custom message. Please try again later!"
      );
      setUpdateInProgress(false);
    }
  };
  return (
    <EditStep
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={editCustomMessage}
      isLoading={updateInProgress}
      isSaveDisabled={!updatedCustomHeader}
      errorMessage={customMessageError || error}
    >
      <CustomMessage
        customHeader={updatedCustomHeader}
        setCustomHeader={setUpdatedCustomHeader}
        customMessage={updatedCustomMessage}
        setCustomMessage={setUpdatedCustomMessage}
      />
    </EditStep>
  );
};

export default EditCustomMessage;
