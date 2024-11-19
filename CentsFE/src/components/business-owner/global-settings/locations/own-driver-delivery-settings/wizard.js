import React, {useState, useEffect} from "react";
import {get, isEmpty} from "lodash";

import {ShiftTypes} from "../../../../../constants";
import {
  validateAllShifts,
  filterShiftwithValidTimings,
  hasWindowNames,
} from "../common/shifts-tab/utils";
import {curateShiftsAndTimings} from "../utils/location";
import {createOwnDriverDeliverySettings} from "../../../../../api/business-owner/delivery-settings";
import {validateZones, getNewZone, isSaveDisabled} from "../utils/service-area";

import WizardStep from "../common/wizard-step/wizard-step";
import Windows from "./forms/windows/windows";
import ServiceArea from "./forms/service-area/service-area";
import SuccessStep from "./success-step/success-step";
import PickupAndDeliveryFee from "./forms/delivery-fee/pickup-and-delivery-fee";
import {ServicePricingOption} from "../constants";
import EditServicePricingAndAvailability from "../general-delivery-settings/edit-service-pricing-availability";

const OwnDriverDeliverySettingsWizard = (props) => {
  const {
    location,
    setDeliveryWizard,
    closeDeliveryWizard,
    fetchDeliverySettings,
    deliverySettings,
  } = props;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasZones, setHasZones] = useState(false);
  const [zipCodeList, setZipCodeList] = useState([]);
  const [validatingZipCode, setValidatingZipCode] = useState(false);
  const [deliveryFeeInCents, setDeliveryFeeInCents] = useState(0);
  const [returnDeliveryFeeInCents, setReturnDeliveryFeeInCents] = useState(0);

  const [isFreeDelivery, setIsFreeDelivery] = useState(!deliveryFeeInCents);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [errors, setErrors] = useState({
    zipcodes: "",
    windows: "",
    pickupAndDeliveryFee: "",
    apiError: "",
  });
  const [isOnDemandSettingsActive, setIsOnDemandSettingsActive] = useState(false);
  const [isGeneralDeliverySettingsActive, setIsGeneralDeliverySettingsActive] = useState(
    false
  );
  const [zones, setZones] = useState([getNewZone()]);

  useEffect(() => {
    fetchDeliverySettings(location?.id);
  }, [fetchDeliverySettings, location, location.id]);

  const [shifts, setShifts] = useState(
    curateShiftsAndTimings([], {
      name: "Window",
      addNewShift: true,
      type: ShiftTypes.OWN_DELIVERY,
      overlapping: true,
    }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
  );

  const validateWindows = () => {
    const {isValid, error} = validateAllShifts(shifts, {overlapping: true});
    if (isValid) {
      setErrors((state) => ({...state, windows: ""}));
      setCurrentStep((state) => state + 1);
    } else {
      setErrors((state) => ({
        ...state,
        windows: error,
      }));
    }
  };
  const areGeneralDeliverySettingsConfigured = () => {
    return (
      !isEmpty(deliverySettings?.generalDeliverySettings) &&
      deliverySettings?.generalDeliverySettings?.deliveryPriceType ===
        ServicePricingOption.deliveryTierPricing &&
      !isEmpty(deliverySettings?.generalDeliverySettings?.deliveryTier)
    );
  };

  // Creates own driver delivery settings.
  const updateOwnDriverDeliverySettings = async () => {
    try {
      setIsApiLoading(true);
      setErrors({
        zipcodes: "",
        windows: "",
        deliveryFee: "",
        apiError: "",
      });
      /* 
      Sending deliveryTierId  if general delivery settings have already setted up and pricing type 
      is delivery tier and if here zones are being used in own-driver so that for each zone delivery tier will be assigned along with the
      deliverableServiceIds.
      */
      let payload = {
        hasZones,
        deliveryFeeInCents,
        returnDeliveryFeeInCents,
        shifts: filterShiftwithValidTimings(shifts),
        ...(hasZones ? {zones} : {zipCodes: zipCodeList}),
      };
      if (areGeneralDeliverySettingsConfigured()) {
        payload.deliveryTierId =
          deliverySettings?.generalDeliverySettings?.deliveryTier?.id;
      }
      const settings = await createOwnDriverDeliverySettings(location?.id, payload);
      if (settings.data.success) {
        setIsOnDemandSettingsActive(settings?.data?.isOnDemandSettingsActive);
        setIsGeneralDeliverySettingsActive(
          settings?.data?.isGeneralDeliverySettingsEnabled
        );
        if (areGeneralDeliverySettingsConfigured()) {
          setCurrentStep(4);
        } else {
          setCurrentStep(5);
        }
      }
    } catch (err) {
      setErrors((state) => ({
        ...state,
        apiError: get(err, "response.data.error", "Something went wrong"),
      }));
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleServiceAreaSubmit = () => {
    if (hasZones) {
      const {isValid, error: errorMsg} = validateZones(zones);
      if (!isValid) {
        setErrors((state) => ({...state, zipcodes: errorMsg}));
        return;
      }
    }
    setErrors((state) => ({...state, zipcodes: ""}));
    setCurrentStep(2);
  };

  const closeEditDeliverySettingsScreen = () => {
    setCurrentStep(5);
  };

  switch (currentStep) {
    case 1:
      return (
        <WizardStep
          currentStep={1}
          totalSteps={3}
          header="Service Area"
          moveToStep={setCurrentStep}
          onSubmit={handleServiceAreaSubmit}
          onCancel={closeDeliveryWizard}
          errorMessage={errors.zipcodes}
          isSaveDisabled={isSaveDisabled(hasZones, zipCodeList, zones)}
          isLoading={validatingZipCode}
        >
          <ServiceArea
            storeId={location?.id}
            setError={(error) => setErrors((state) => ({...state, zipcodes: error}))}
            setZipCodeList={(list) => setZipCodeList(list)}
            zipCodeList={zipCodeList}
            hasZones={hasZones}
            setHasZones={setHasZones}
            setLoading={(value) => setValidatingZipCode(value)}
            zones={zones}
            setZones={setZones}
          />
        </WizardStep>
      );
    case 2:
      return (
        <WizardStep
          currentStep={2}
          totalSteps={3}
          header="Pickup & Delivery Windows"
          moveToStep={setCurrentStep}
          onCancel={closeDeliveryWizard}
          isLoading={loading}
          errorMessage={errors.windows}
          onSubmit={validateWindows}
          isSaveDisabled={!hasWindowNames(shifts)}
          contentClassName="shifts-content"
        >
          <Windows
            formType="NEW"
            hasZones={hasZones}
            zones={zones}
            shifts={shifts}
            setShifts={setShifts}
            location={location}
            setLoading={setLoading}
            setError={(error) => setErrors((state) => ({...state, windows: error}))}
          />
        </WizardStep>
      );
    case 3:
      return (
        <WizardStep
          currentStep={3}
          totalSteps={3}
          header="Pickup / Delivery Fee"
          moveToStep={setCurrentStep}
          onCancel={closeDeliveryWizard}
          isSaveDisabled={!isFreeDelivery && !deliveryFeeInCents}
          errorMessage={errors.pickupAndDeliveryFee}
          isLoading={isApiLoading}
          onSubmit={updateOwnDriverDeliverySettings}
        >
          <PickupAndDeliveryFee
            hasZones={hasZones}
            isFreeDelivery={isFreeDelivery}
            setIsFreeDelivery={setIsFreeDelivery}
            deliveryFeeInCents={deliveryFeeInCents}
            setDeliveryFeeInCents={setDeliveryFeeInCents}
            setReturnDeliveryFeeInCents={(value) =>
              setReturnDeliveryFeeInCents(value || 0)
            }
            resetError={() =>
              setErrors({
                zipcodes: "",
                windows: "",
                deliveryFee: "",
                apiError: "",
              })
            }
          />
        </WizardStep>
      );
    case 4:
      return (
        <EditServicePricingAndAvailability
          closeEditDeliverySettingsScreen={closeEditDeliverySettingsScreen}
          selectedLocation={location}
          deliverySettings={deliverySettings}
          isSaveEnabled
        />
      );
    case 5:
      return (
        <SuccessStep
          setDeliveryWizard={setDeliveryWizard}
          isOnDemandSettingsActive={isOnDemandSettingsActive}
          isGeneralDeliverySettingsActive={isGeneralDeliverySettingsActive}
        />
      );

    default:
      return null;
  }
};

export default OwnDriverDeliverySettingsWizard;
