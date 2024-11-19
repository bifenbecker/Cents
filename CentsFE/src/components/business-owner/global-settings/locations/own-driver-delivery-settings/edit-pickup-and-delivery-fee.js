import React, {useState} from "react";

import {updateOwnDriverDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import PickupAndDeliveryFee from "./forms/delivery-fee/pickup-and-delivery-fee";

const EditPickupAndDeliveryFee = (props) => {
  const {
    storeId,
    hasZones,
    deliveryFee,
    returnDeliveryFee,
    closeEditDeliverySettingsScreen,
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [deliveryFeeInCents, setDeliveryFeeInCents] = useState(deliveryFee);
  const [isFreeDelivery, setIsFreeDelivery] = useState(!deliveryFee);
  const [returnDeliveryFeeInCents, setReturnDeliveryFeeInCents] = useState(
    returnDeliveryFee
  );

  const updateFee = async () => {
    try {
      setLoading(true);
      setError();
      await updateOwnDriverDeliverySettings(storeId, {
        deliveryFeeInCents: isFreeDelivery ? 0 : deliveryFeeInCents,
        returnDeliveryFeeInCents,
      });
      closeEditDeliverySettingsScreen();
    } catch (error) {
      setError(error?.response?.data?.error, "Could not update zip codes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditStep
      header="Pickup / Delivery Fee"
      isLoading={loading}
      errorMessage={error}
      onSubmit={updateFee}
      onCancel={closeEditDeliverySettingsScreen}
      isSaveDisabled={!isFreeDelivery && !deliveryFeeInCents}
    >
      <PickupAndDeliveryFee
        hasZones={hasZones}
        isFreeDelivery={isFreeDelivery}
        setIsFreeDelivery={setIsFreeDelivery}
        deliveryFeeInCents={deliveryFeeInCents}
        setDeliveryFeeInCents={(value) => setDeliveryFeeInCents(value || 0)}
        returnDeliveryFeeInCents={returnDeliveryFeeInCents}
        setReturnDeliveryFeeInCents={(value) => setReturnDeliveryFeeInCents(value || 0)}
        resetError={() => {}}
      />
    </EditStep>
  );
};

export default EditPickupAndDeliveryFee;
