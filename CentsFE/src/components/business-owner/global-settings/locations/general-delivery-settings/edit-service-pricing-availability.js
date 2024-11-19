import React, {useReducer, useState} from "react";

import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import {ServicePricingAndAvailability} from "../../../../../containers/bo-locations-delivery-settings";
import reducer, {initialState} from "./reducer";
import {buildDeliveryPricingPayload} from "../utils/location";
import ServiceDisableErrorPopup from "./service-disable-error-popup";
import {isEqual, sortBy} from "lodash";
import {ServicePricingOption} from "../constants";

const EditServicePricingAndAvailability = (props) => {
  const {
    closeEditDeliverySettingsScreen,
    selectedLocation,
    deliverySettings,
    isSaveEnabled,
  } = props;
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  });

  const editDeliveryServices = async (payload) => {
    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });
      await updateDeliverySettings(selectedLocation?.id, payload);
      closeEditDeliverySettingsScreen();
    } catch (err) {
      if (err.response.data.type === "ACTIVE_SUBSCRIPTIONS") {
        setShowConfirmationPopup(true);
        dispatch({
          type: "RESET_DATA", //setting back the old selection since the edit failed
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload:
            err?.message || "Could not update delivery services. Please try again later!",
        });
      }
    } finally {
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  };

  const onEditDeliveryServicePricing = () => {
    const {
      zones,
      deliveryTier,
      selectedServicesForRetailPricing,
      deliveryPriceType,
      deliverySettings,
    } = state;
    const payload = buildDeliveryPricingPayload(
      zones,
      deliveryTier,
      selectedServicesForRetailPricing,
      deliveryPriceType,
      deliverySettings
    );
    if (!payload.error) {
      editDeliveryServices(payload?.payload);
    } else {
      dispatch({
        type: "SET_ERROR",
        payload: payload?.error,
      });
    }
  };
  const {
    deliveryPriceType,
    selectedServicesForRetailPricing,
    selectedServicesForRetailPricingCopy,
    deliveryTier,
    deliveryTierCopy,
    zones,
    zonesCopy,
  } = state;
  const {generalDeliverySettings = {}, ownDriverDeliverySettings = {}} = deliverySettings;

  const isSaveDisabled = () => {
    return (
      isSaveEnabled ||
      deliveryPriceType !== generalDeliverySettings?.deliveryPriceType ||
      (generalDeliverySettings?.deliveryPriceType ===
        ServicePricingOption.storeRetailPricingOption &&
        !isEqual(
          sortBy(selectedServicesForRetailPricing, ["value"]),
          sortBy(selectedServicesForRetailPricingCopy, ["value"])
        )) ||
      (generalDeliverySettings?.deliveryPriceType ===
        ServicePricingOption.deliveryTierPricing &&
        ((!ownDriverDeliverySettings?.hasZones &&
          !isEqual(deliveryTier, deliveryTierCopy)) ||
          (ownDriverDeliverySettings?.hasZones &&
            !isEqual(sortBy(zones, ["id"]), sortBy(zonesCopy, ["id"])))))
    );
  };

  return (
    <EditStep
      header="Service Pricing & Availability"
      onCancel={closeEditDeliverySettingsScreen}
      onSubmit={onEditDeliveryServicePricing}
      isLoading={state?.loading}
      errorMessage={state?.error}
      isSaveDisabled={!isSaveDisabled()}
    >
      <ServicePricingAndAvailability
        location={selectedLocation}
        state={state}
        dispatch={dispatch}
        isEdit
        deliverySettings={deliverySettings}
      />
      {showConfirmationPopup && (
        <ServiceDisableErrorPopup setShowConfirmationPopup={setShowConfirmationPopup} />
      )}
    </EditStep>
  );
};

export default EditServicePricingAndAvailability;
