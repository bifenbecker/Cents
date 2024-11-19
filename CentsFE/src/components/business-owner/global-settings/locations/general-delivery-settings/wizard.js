import React, {useState, useReducer} from "react";
import get from "lodash/get";

import {MaxTurnAroundTime} from "../constants";
import {updateDeliverySettings} from "../../../../../api/business-owner/delivery-settings";
import reducer, {initialState} from "./reducer";
import WizardStep from "../common/wizard-step/wizard-step";
import TurnaroundTime from "./forms/turnaround-time";
import SuccessStep from "./success-step/success-step";
import RecurringDiscount from "./forms/recurring-discount/RecurringDiscount";
import {ServicePricingAndAvailability} from "../../../../../containers/bo-locations-delivery-settings";
import {buildDeliveryPricingPayload} from "../utils/location";
import {useFlags} from "launchdarkly-react-client-sdk";

const GeneralDeliverySettingsWizard = (props) => {
  const {
    setDeliveryWizard,
    closeDeliveryWizard,
    selectedLocation,
    deliverySettings,
    location,
    deliverySettingsLoading,
  } = props;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwndriverSettingsActive, setIsOwndriverSettingsActive] = useState(false);
  const [isOnDemandSettingsActive, setIsOnDemandSettingsActive] = useState(false);
  const flags = useFlags();
  const [turnAroundInHours, setTurnAroundInHours] = useState();
  const [recurringDiscountInPercent, setRecurringDiscountInPercent] = useState(null);
  const [hasRecurringDiscount, setHasRecurringDiscount] = useState(false);
  const [errors, setErrors] = useState({
    turnaroundTimeError: "",
    apiError: "",
    recurringError: "",
  });

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
  });

  const saveDeliverySettings = async () => {
    try {
      if (turnAroundInHours > MaxTurnAroundTime) {
        setErrors((state) => ({
          ...state,
          turnaroundTimeError: "Please enter a number not more than 168.",
        }));
        return;
      }
      setIsLoading(true);
      setErrors({
        turnaroundTimeError: "",
        apiError: "",
        recurringError: "",
      });
      let resp = await updateDeliverySettings(selectedLocation?.id, {
        deliveryEnabled: true,
        turnAroundInHours,
        recurringDiscountInPercent: Number(recurringDiscountInPercent),
        ...state.servicePricingAndAvailabilityPayload,
      });
      if (resp.data.success) {
        setIsOnDemandSettingsActive(resp.data?.isOnDemandSettingsActive);
        setIsOwndriverSettingsActive(resp.data?.isOwndriverSettingsActive);
        setCurrentStep(4);
      }
    } catch (err) {
      setErrors((state) => ({
        ...state,
        apiError: get(err, "response.data.error", "Something went wrong"),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const onRecurringDiscountSubmit = () => {
    const discount = Number(recurringDiscountInPercent);
    setRecurringDiscountInPercent(isNaN(discount) ? 0 : discount);
    setCurrentStep(3);
  };

  const handleRecurringError = (value) => {
    setErrors((state) => ({
      ...state,
      recurringError: value,
    }));
  };

  const onSaveDeliveryServicePricing = () => {
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
      dispatch({
        type: "SET_SERVICE_PRICING_AVAILABILITY_PAYLOAD",
        payload: payload?.payload,
      });
      setCurrentStep(2);
    } else {
      dispatch({
        type: "SET_ERROR",
        payload: payload?.error,
      });
    }
  };

  if (flags.cents20) {
    switch (currentStep) {
      case 1:
        return (
          <WizardStep
            currentStep={1}
            totalSteps={2}
            header="Service Pricing & Availability"
            moveToStep={setCurrentStep}
            onCancel={closeDeliveryWizard}
            isLoading={state?.loading || deliverySettingsLoading}
            errorMessage={state?.error}
            onSubmit={onSaveDeliveryServicePricing}
          >
            <ServicePricingAndAvailability
              deliverySettings={deliverySettings}
              location={location}
              state={state}
              dispatch={dispatch}
            />
          </WizardStep>
        );
      case 2:
        return (
          <WizardStep
            currentStep={2}
            totalSteps={2}
            header="Discount for Recurring"
            moveToStep={setCurrentStep}
            onCancel={closeDeliveryWizard}
            isLoading={isLoading}
            isSaveDisabled={
              hasRecurringDiscount && Number(recurringDiscountInPercent) === 0
            }
            onSubmit={onRecurringDiscountSubmit}
            errorMessage={errors.recurringError}
          >
            <RecurringDiscount
              recurringDiscountInPercent={recurringDiscountInPercent}
              setRecurringDiscountInPercent={setRecurringDiscountInPercent}
              hasRecurringDiscount={hasRecurringDiscount}
              setHasRecurringDiscount={setHasRecurringDiscount}
              error={errors.recurringError}
              setError={handleRecurringError}
            />
          </WizardStep>
        );
      case 3:
        return (
          <SuccessStep
            setDeliveryWizard={setDeliveryWizard}
            isOnDemandSettingsActive={isOnDemandSettingsActive}
            isOwndriverSettingsActive={isOwndriverSettingsActive}
          />
        );

      default:
        return null;
    }
  } else {
    switch (currentStep) {
      case 1:
        return (
          <WizardStep
            currentStep={1}
            totalSteps={3}
            header="Service Pricing & Availability"
            moveToStep={setCurrentStep}
            onCancel={closeDeliveryWizard}
            isLoading={state?.loading || deliverySettingsLoading}
            errorMessage={state?.error}
            onSubmit={onSaveDeliveryServicePricing}
          >
            <ServicePricingAndAvailability
              deliverySettings={deliverySettings}
              location={location}
              state={state}
              dispatch={dispatch}
            />
          </WizardStep>
        );
      case 2:
        return (
          <WizardStep
            currentStep={2}
            totalSteps={3}
            header="Discount for Recurring"
            moveToStep={setCurrentStep}
            onCancel={closeDeliveryWizard}
            isLoading={isLoading}
            isSaveDisabled={
              hasRecurringDiscount && Number(recurringDiscountInPercent) === 0
            }
            onSubmit={onRecurringDiscountSubmit}
            errorMessage={errors.recurringError}
          >
            <RecurringDiscount
              recurringDiscountInPercent={recurringDiscountInPercent}
              setRecurringDiscountInPercent={setRecurringDiscountInPercent}
              hasRecurringDiscount={hasRecurringDiscount}
              setHasRecurringDiscount={setHasRecurringDiscount}
              error={errors.recurringError}
              setError={handleRecurringError}
            />
          </WizardStep>
        );
      case 3:
        return (
          <WizardStep
            currentStep={3}
            totalSteps={3}
            header="Turnaround Time"
            moveToStep={setCurrentStep}
            onSubmit={saveDeliverySettings}
            onCancel={closeDeliveryWizard}
            isSaveDisabled={!turnAroundInHours}
            isLoading={isLoading}
            errorMessage={errors.turnaroundTimeError || errors.apiError}
          >
            <TurnaroundTime
              selectedTime={turnAroundInHours}
              setTurnAroundTime={(time) => setTurnAroundInHours(time)}
              resetError={() =>
                setErrors({
                  turnaroundTimeError: "",
                  apiError: "",
                })
              }
            />
          </WizardStep>
        );
      case 4:
        return (
          <SuccessStep
            setDeliveryWizard={setDeliveryWizard}
            isOnDemandSettingsActive={isOnDemandSettingsActive}
            isOwndriverSettingsActive={isOwndriverSettingsActive}
          />
        );

      default:
        return null;
    }
  }
};

export default GeneralDeliverySettingsWizard;
