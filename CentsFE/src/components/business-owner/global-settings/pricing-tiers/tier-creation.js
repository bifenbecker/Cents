/* eslint-disable prettier/prettier */
import React, {Fragment, useMemo, useState} from "react";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Progress} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import TierType from "./wizards/tier-type";
import {TIER_PRICING_COPY_OPTIONS} from "./constants";
import TierPricingCopyOptions from "./wizards/tier-pricing-copy-options";
import {TierPricing, TierPricing20} from "./wizards/tier-pricing/index";
import {getServiceandInventoryPrices, formatServicePricesData} from "./utlis";
import get from "lodash/get";
import {TIER_TYPE} from "./constants";
import BlockingLoader from "components/commons/blocking-loader/blocking-loader";
import AddEditOnlineOrderServices from "./wizards/add-edit-online-order-services";
import CancelTierCreationPopUp from "./cancel-tier-creation-pop-up";
import {createTier, validateTierName} from "api/business-owner/tiers";
import SetCommercialDeliveryFee from "./wizards/commercial-delivery-fee/set-commercial-delivery";
import {withLDConsumer, useFlags} from "launchdarkly-react-client-sdk";

const RenderWizardScreen = ({
  currentStep,
  setTierData,
  tierData,
  setError,
  state,
  setCurrentStep,
  setShouldValidateTierName,
  loading,
  validateTierNameApi
}) => {
  const flags = useFlags();

  switch (currentStep) {
    case 1:
      return (
        <TierType
          setTierData={setTierData}
          tierData={tierData}
          state={state}
          setError={setError}
          setCurrentStep={setCurrentStep}
          currentStep={currentStep}
          setShouldValidateTierName={setShouldValidateTierName}
          loading={loading}
          validateTierNameApi={validateTierNameApi}
        />
      );
    case 2:
      return (
        <TierPricingCopyOptions
          setTierData={setTierData}
          tierData={tierData}
          setError={setError}
        />
      );
    case 3:
      return flags.cents20 ? (
        <TierPricing20
          setTierData={setTierData}
          tierData={tierData}
          setError={setError}
          state={state}
        />
        ) : (
        <TierPricing
          setTierData={setTierData}
          tierData={tierData}
          setError={setError}
          state={state}
        />
        );
    case 4:
      return <AddEditOnlineOrderServices setTierData={setTierData} tierData={tierData} />;
    case 5:
      if (tierData.type === TIER_TYPE.commercial) {
        return <SetCommercialDeliveryFee setTierData={setTierData} tierData={tierData} />;
      }
    default:
      return <p>Something went wrong</p>;
  }
};

const TierCreation = ({
  state,
  dispatch,
  fetchPricingTiers,
  flags,
  setShowHideNewTierWizard,
}) => {
  const [tierData, setTierData] = useState({
    pricingOption: TIER_PRICING_COPY_OPTIONS.existingPricing,
  });
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(4);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [shouldValidateTierName, setShouldValidateTierName] = useState(true);
  const [loading, setLoading] = useState(false);

  const onClick = () => setShowHideNewTierWizard(false);
  const onCancel = () => setShowWarningModal(false);

  const handleBackClick = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const validateTier = async () => {
    try {
      const validationData = {
        type: tierData?.type,
        name: tierData?.name?.trim(),
      };

      setError(null);
      setLoading(true);
      setShouldValidateTierName(false);
      let result = await validateTierName(validationData);

      if (!result?.data?.success) {
        setError(
          `A ${tierData?.type?.toLowerCase()} tier with the same name already exists`
        );
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      setError("Could not validate the tier name");
    } finally {
      setLoading(false);
    }
  };

  const handleNextOrSave = () => {
    if (currentStep === 2) {
      setTierData((state) => ({
        ...state,
        servicesData: [],
        productsList: [],
        onlineOrderServices: [],
      }));
    }
    if (shouldValidateTierName) {
      validateTier();
    } else if (
      (tierData.type !== TIER_TYPE.commercial && currentStep === 4) ||
      currentStep === 5
    ) {
      // create tier
      onCreateTier();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 4:
        return tierData.type !== TIER_TYPE.commercial ? "Save" : "Next";
      case 5:
        return "Save";
      default:
        return "Next";
    }
  };

  const getWizardHeaderText = () => {
    switch (currentStep) {
      case 1:
        return "New Pricing Tier";
      case 4:
        return "Online Ordering";
      case 5:
        return "Commercial Delivery Pricing";
      default:
        return `${tierData?.type?.toLowerCase()} Tier Pricing`;
    }
  };

  const handleDisableNextOrSave = () => {
    switch (currentStep) {
      case 1:
        return !(tierData?.type && tierData?.name && tierData?.name?.length > 0) || error;
      case 2:
        return (
          tierData?.pricingOption === TIER_PRICING_COPY_OPTIONS.existingPricing &&
          !(tierData?.locationId || tierData?.tierId)
        );

      case 3:
        return !(tierData?.servicesData || tierData?.productsList) || error;
      case 4:
        return (
          !tierData?.onlineOrderServices?.length ||
          tierData?.onlineOrderServices?.includes(null)
        );
      default:
        return false;
    }
  };

  const progress = useMemo(
    () => (!Number(currentStep) ? 1 : Number(currentStep) * 100) / Number(totalSteps) - 1,
    [currentStep, totalSteps]
  );

  const handleCancelButton = () => {
    setShowWarningModal(true);
  };

  const onCreateTier = async () => {
    const payload = {};
    const prices = getServiceandInventoryPrices(
      formatServicePricesData(tierData?.servicesData)?.concat(tierData?.productsList) ||
        [],
      tierData?.onlineOrderServices
    );

    payload.name = tierData?.name;
    payload.type = tierData?.type;
    payload.servicePrices = prices?.services;
    payload.inventoryPrices = prices?.inventories;
    payload.commercialDeliveryFeeInCents = tierData?.commercialDeliveryFeeInCents;
    payload.locationId = tierData?.locationId;
    payload.offerDryCleaningForDeliveryTier = tierData?.offerDryCleaningForDeliveryTier;

    try {
      dispatch({
        type: "SET_LOADER",
        payload: true,
      });

      const res = await createTier(payload);
      if (res?.data?.success) {
        dispatch({
          type: "SET_NEW_TIER_INFO",
          payload: {
            id: res?.data?.tierDetails?.id,
            name: res?.data?.tierDetails?.name,
          },
        });
        tierData?.type === TIER_TYPE[state?.activeRoundedTab]
          ? fetchPricingTiers(tierData?.type?.toLowerCase())
          : dispatch({
              type: "SET_ACTIVE_ROUNDED_TAB",
              payload: tierData?.type?.toLowerCase(),
            });
      }
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: get(error, "response.data.error", "Error while creating a tier"),
      });
      dispatch({
        type: "SET_LOADER",
        payload: false,
      });
    }
  };

  return (
    <Fragment>
      {/* BEGIN HEADER */}
      <Fragment>
        <div className="locations-card-header wizard-header">
          {currentStep > 1 && (
            <div className="back-button-container" onClick={handleBackClick}>
              <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
              <button className="btn btn-text-only cancel-button">Back</button>
            </div>
          )}
          <p className={"header-text"}>{getWizardHeaderText()}</p>
        </div>
        <Progress value={progress} className="_progressbar" />
      </Fragment>

      {/* END HEADER*/}
      {state?.loading ? <BlockingLoader /> : null}
      <div className="tiers-wizard-body">
        <RenderWizardScreen
          state={state}
          dispatch={dispatch}
          tierData={tierData}
          setTierData={setTierData}
          setTotalSteps={setTotalSteps}
          currentStep={currentStep}
          setError={setError}
          setCurrentStep={setCurrentStep}
          setShouldValidateTierName={setShouldValidateTierName}
          loading={loading}
          validateTierNameApi={validateTier}
        />
      </div>

      {/* ----- BEGIN FOOTER ---- */}
      <div className={`service-prices-footer`}>
        {
          <p className="service-footer-error-message new-service">
            {error &&
            !(
              tierData?.pricingOption === TIER_PRICING_COPY_OPTIONS.newPricing &&
              currentStep === 2
            )
              ? error
              : null}
          </p>
        }
        <button
          className="btn btn-text-only cancel-button"
          id="cancel-button"
          onClick={handleCancelButton}
        >
          Cancel
        </button>
        {showWarningModal && (
          <CancelTierCreationPopUp
            onClick={onClick}
            onCancel={onCancel}
            cancelMessage={
              " You are not finished setting up this pricing tier. Do you want to exit now? Your settings will not be saved."
            }
          />
        )}
        <button
          className="btn-theme btn-rounded save-button"
          onClick={handleNextOrSave}
          disabled={handleDisableNextOrSave()}
        >
          {getButtonText()}
        </button>
      </div>
    </Fragment>
  );
};

export default withLDConsumer()(TierCreation);
