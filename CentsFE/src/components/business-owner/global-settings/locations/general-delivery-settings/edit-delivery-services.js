import React, {useState, useMemo} from "react";
import {compact} from "lodash";

import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import DeliveryServices from "./forms/delivery-services";
import ServiceDisableErrorPopup from "./service-disable-error-popup";

const EditDeliveryServices = (props) => {
  const {closeEditDeliverySettingsScreen, selectedLocation} = props;
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [deliveredServicesOptions, setDeliveredServicesOptions] = useState([]);
  const [error, setError] = useState();
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [deliveryServiceStatus, setDeliveryServiceStatus] = useState({});
  const [removedServices, setRemovedServices] = useState([]);
  const selectedServiceIds = useMemo(
    () => compact(deliveredServicesOptions).map(({value}) => value),
    [deliveredServicesOptions]
  );

  const editDeliveryServices = async () => {
    try {
      setError();
      setUpdateInProgress(true);
      await updateDeliverySettings(selectedLocation?.id, {
        deliveryServiceIds: selectedServiceIds,
      });
      closeEditDeliverySettingsScreen();
    } catch (err) {
      setDeliveredServicesOptions([...deliveredServicesOptions, ...removedServices]);
      setRemovedServices([]);
      if (err.response.data.type === "ACTIVE_SUBSCRIPTIONS") {
        setShowConfirmationPopup(true);
      } else {
        setError(
          err?.response?.data.error ||
            "Could not update delivery services. Please try again later!"
        );
      }
    } finally {
      setUpdateInProgress(false);
    }
  };

  return (
    <EditStep
      header="Delivery Services"
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={editDeliveryServices}
      isSaveDisabled={deliveryServiceStatus.isSaveDisabled}
      isLoading={updateInProgress || deliveryServiceStatus.isLoading}
      errorMessage={error || deliveryServiceStatus.error}
    >
      <DeliveryServices
        selectedLocation={selectedLocation}
        onServiceSelection={setDeliveredServicesOptions}
        deliveredServicesOptions={deliveredServicesOptions}
        setDeliveryServiceStatus={setDeliveryServiceStatus}
        deliveryServiceStatus={deliveryServiceStatus}
        removedServices={removedServices}
        setRemovedServices={setRemovedServices}
      />
      {showConfirmationPopup && (
        <ServiceDisableErrorPopup setShowConfirmationPopup={setShowConfirmationPopup} />
      )}
    </EditStep>
  );
};

export default EditDeliveryServices;
