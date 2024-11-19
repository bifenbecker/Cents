import React, {useState} from "react";
import get from "lodash/get";

import {ShiftTypes} from "../../../../../constants";
import {
  validateAllShifts,
  filterOnDemandShiftsData,
  hasWindowNames,
} from "../common/shifts-tab/utils";
import {curateShiftsAndTimings} from "../utils/location";
import {createOnDemandDeliverySettings} from "../../../../../api/business-owner/delivery-settings";

import WizardStep from "../common/wizard-step/wizard-step";
import DeliverySubsidy from "./forms/delivery-subsidy/delivery-subsidy";
import PickUpDropOffHours from "./forms/pick-up-drop-off-hours/pick-up-drop-off-hours";
import SuccessStep from "./success-step/success-step";

const OnDemandDeliverySettingsWizard = ({
  deliverySettings,
  setDeliveryWizard,
  closeDeliveryWizard,
  location,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    windows: "",
    pickupAndDeliveryFee: "",
    apiError: "",
  });

  const [shifts, setShifts] = useState(
    curateShiftsAndTimings([], {
      name: "Window",
      addNewShift: true,
      type: ShiftTypes.CENTS_DELIVERY,
      overlapping: true,
    }).map((w) => ({...w, name: w.name.replace("+ ", "")}))
  );
  const [subsidyInCents, setSubsidyInCents] = useState(0);
  const [returnOnlySubsidyInCents, setReturnOnlySubsidyInCents] = useState(0);
  const [deliverySubsidyStatus, setDeliverySubsidyStatus] = useState({});
  const [isOwndriverSettingsActive, setIsOwndriverSettingsActive] = useState(false);
  const [isGeneralDeliverySettingsActive, setIsGeneralDeliverySettingsActive] = useState(
    false
  );

  const saveOnDemandDeliverySettings = () => {
    setIsLoading(true);
    setErrors({apiError: ""});
    createOnDemandDeliverySettings(location.id, {
      subsidyInCents,
      returnOnlySubsidyInCents,
      shifts: filterOnDemandShiftsData(shifts),
    })
      .then(
        ({
          data: {success, isOwndriverSettingsActive, isGeneralDeliverySettingsEnabled},
        }) => {
          setIsOwndriverSettingsActive(isOwndriverSettingsActive);
          setIsGeneralDeliverySettingsActive(isGeneralDeliverySettingsEnabled);
          success && setCurrentStep(3);
        }
      )
      .catch((err) =>
        setErrors((state) => ({
          ...state,
          apiError: get(err, "response.data.error", "Something went wrong"),
        }))
      )
      .finally(() => setIsLoading(false));
  };

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

  switch (currentStep) {
    case 1:
      return (
        <WizardStep
          currentStep={1}
          totalSteps={2}
          header="Pickup & Dropoff Hours"
          moveToStep={setCurrentStep}
          isSaveDisabled={!hasWindowNames(shifts)}
          onCancel={closeDeliveryWizard}
          errorMessage={errors.windows}
          onSubmit={validateWindows}
          contentClassName="shifts-content pickup-dropoff-card-content"
        >
          <PickUpDropOffHours
            shifts={shifts}
            setShifts={setShifts}
            setError={(error) =>
              setErrors((state) => ({
                ...state,
                windows: error,
              }))
            }
            setLoading={setIsLoading}
            storeId={location?.id}
          />
        </WizardStep>
      );
    case 2:
      return (
        <WizardStep
          currentStep={2}
          totalSteps={2}
          header="Delivery Subsidy"
          moveToStep={setCurrentStep}
          onSubmit={saveOnDemandDeliverySettings}
          onCancel={closeDeliveryWizard}
          isSaveDisabled={deliverySubsidyStatus.isSaveDisabled}
          isLoading={isLoading}
          errorMessage={errors.apiError}
        >
          <DeliverySubsidy
            subsidyInCents={subsidyInCents}
            returnOnlySubsidyInCents={returnOnlySubsidyInCents}
            setReturnOnlySubsidyInCents={setReturnOnlySubsidyInCents}
            setSubsidyInCents={setSubsidyInCents}
            setDeliverySubsidyStatus={setDeliverySubsidyStatus}
          />
        </WizardStep>
      );
    case 3:
      return (
        <SuccessStep
          setDeliveryWizard={setDeliveryWizard}
          isOwndriverSettingsActive={isOwndriverSettingsActive}
          isGeneralDeliverySettingsActive={isGeneralDeliverySettingsActive}
        />
      );

    default:
      return null;
  }
};

export default OnDemandDeliverySettingsWizard;
