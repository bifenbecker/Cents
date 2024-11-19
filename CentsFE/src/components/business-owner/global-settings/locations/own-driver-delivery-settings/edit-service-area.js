import React, {useState} from "react";

import {updateOwnDriverDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import EditStep from "../common/edit-step/edit-step";
import ServiceArea from "./forms/service-area/service-area";
import {validateZones, getNewZone, isSaveDisabled} from "../utils/service-area";
import isEmpty from "lodash/isEmpty";
import {ServicePricingOption} from "../constants";
import EditServicePricingAndAvailability from "../general-delivery-settings/edit-service-pricing-availability";

const EditServiceAreaWizard = (props) => {
  const {
    zipCodeList: currentZipCodes,
    storeId,
    closeEditDeliverySettingsScreen,
    zones,
    hasZones,
    deliverySettings,
    location,
  } = props;

  const [loading, setLoading] = useState(false);
  const [zipCodeList, setZipCodeList] = useState(currentZipCodes || []);
  const [error, setError] = useState();
  const [currentZones, setCurrentZones] = useState(
    zones?.length ? [...zones] : [getNewZone()]
  );
  const [updatedHasZones, setupdatedHasZones] = useState(hasZones);
  const [showEditServicePricing, setShowEditServicePricing] = useState(false);

  const validateAndSaveZones = () => {
    if (!updatedHasZones) {
      updateZipCodes();
    } else {
      const {isValid, error: errorMsg} = validateZones(currentZones);
      if (isValid) {
        setError();
        updateZipCodes();
      } else {
        setError(errorMsg);
      }
    }
  };

  const doDeliveryGeneralSettingsandPriceTypeExist = () => {
    return (
      !isEmpty(deliverySettings?.generalDeliverySettings) &&
      deliverySettings?.generalDeliverySettings?.deliveryPriceType ===
        ServicePricingOption.deliveryTierPricing
    );
  };

  const updateZipCodes = async () => {
    try {
      setLoading(true);
      setError();
      /* 
      If a new zone was added we are adding latest zone deliverTierId as well to that newly added zone payload
      */
      const payload = {
        hasZones: updatedHasZones,
        ...(updatedHasZones
          ? {
              zones: currentZones?.map((zone) => {
                if (!zone?.deliveryTier) {
                  return {
                    ...zone,
                    deliveryTierId: zones[zones?.length - 1]?.deliveryTier?.id,
                  };
                }
                return zone;
              }),
            }
          : {zipCodes: zipCodeList}),
      };
      if (updatedHasZones && !hasZones && doDeliveryGeneralSettingsandPriceTypeExist()) {
        /* 
       When switching from zipcodes to zones
       1.Checking if generalsettings has already setted up and using delivery tier pricing
       2. Assign the tierId which is being used at location level to ech zone.
      */
        payload.zones = currentZones?.map((zone) => {
          return {
            ...zone,
            deliveryTierId: deliverySettings?.generalDeliverySettings?.deliveryTier?.id,
          };
        });
        await updateOwnDriverDeliverySettings(storeId, payload);
        setShowEditServicePricing(true);
        return;
      }
      if (!updatedHasZones && hasZones && doDeliveryGeneralSettingsandPriceTypeExist()) {
        /* 
       When switching from zones to zipcode
       1.Checking if generalsettings has already setted up and using delivery tier pricing
       2. Assign the tierId which is being used for the first zone from list of zones and send that deliveryTierId to API
      */
        payload.deliveryTierId = currentZones[0]?.deliveryTier?.id;
        await updateOwnDriverDeliverySettings(storeId, payload);
        setShowEditServicePricing(true);
        return;
      }
      await updateOwnDriverDeliverySettings(storeId, payload);
      if (
        !currentZones.every((zone) => zone?.id) &&
        doDeliveryGeneralSettingsandPriceTypeExist()
      ) {
        /* 
       When new zones are added,generalsettings has already setted up and using delivery tier pricing, show 
       edit service pricing in edit view.
      
      */
        setShowEditServicePricing(true);
        return;
      }
      closeEditDeliverySettingsScreen();
    } catch (error) {
      setError(error?.response?.data?.error || "Could not update zip codes");
    } finally {
      setLoading(false);
    }
  };

  return showEditServicePricing ? (
    <EditServicePricingAndAvailability
      closeEditDeliverySettingsScreen={closeEditDeliverySettingsScreen}
      selectedLocation={location}
      deliverySettings={deliverySettings}
      isSaveEnabled
    />
  ) : (
    <EditStep
      header="Service Area"
      isLoading={loading}
      errorMessage={error}
      onSubmit={validateAndSaveZones}
      onCancel={closeEditDeliverySettingsScreen}
      isSaveDisabled={isSaveDisabled(updatedHasZones, zipCodeList, currentZones)}
    >
      <ServiceArea
        storeId={storeId}
        setError={(error) => setError(error)}
        setZipCodeList={setZipCodeList}
        zipCodeList={zipCodeList}
        setZones={setCurrentZones}
        setLoading={setLoading}
        hasZones={updatedHasZones}
        zones={currentZones}
        setHasZones={setupdatedHasZones}
        editForm
      />
    </EditStep>
  );
};

export default EditServiceAreaWizard;
