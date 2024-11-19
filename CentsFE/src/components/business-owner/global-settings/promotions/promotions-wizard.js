import React, {Fragment, useState, useEffect, useCallback} from "react";

// Libraries
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Progress} from "reactstrap";
import PropTypes from "prop-types";

// Commons
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

// Components for Wizard Steps
import NewPromotion from "./promotion-wizard-steps/NewPromotion";
import PromotionValue from "./promotion-wizard-steps/PromotionValue";
import PromotionMinimumRequirements from "./promotion-wizard-steps/PromotionMinimumRequirements";
import PromoLocationEligibility from "./promotion-wizard-steps/PromoLocationEligibility";
import PromoUsageLimits from "./promotion-wizard-steps/PromoUsageLimits";
import PromoActiveDays from "./promotion-wizard-steps/PromoActiveDays";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import useTrackEvent from "../../../../hooks/useTrackEvent";

const WIZARD_HEADER_AND_PROGRESS_MAPPING = {
  1: {header: "New Promotion", progress: 16},
  2: {header: "Value", progress: 32},
  3: {header: "Minimum Requirements", progress: 48},
  4: {header: "Location Eligibility", progress: 64},
  5: {header: "Usage Limits", progress: 80},
  6: {header: "Active Dates", progress: 96},
};

const PROMOTION_WIZARD_STEPS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

const PromotionsWizard = (props) => {
  const {trackEvent} = useTrackEvent();
  const [newPromoDetails, setNewPromoDetails] = useState({
    promotionCode: "",
    promotionTypes: [
      {
        label: "Fixed Price Discount",
        value: "fixed-price-discount",
        active: false,
      },
      {
        label: "Percentage Discount",
        value: "percentage-discount",
        active: false,
      },
    ],
    discountValue: "",
    appliesToType: "",
    promotionProgramItems: null,
    minRequirements: {reqType: "", reqValues: {minPurchaseAmount: "", minQuantity: ""}},
    locationEligibility: "",
    usageLimits: {usageType: "", usageValue: ""},
    activeDays: [],
    startDate: null,
    endDate: null,
    hasEndDate: false,
  });

  useEffect(() => {
    return () => {
      props.updateStepCountInWizard(1);
      props.resetPromotionsWizardReduxState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackAddingNewPromotionEvent = (promotionName) => {
    trackEvent(INTERCOM_EVENTS.promotions, INTERCOM_EVENTS_TEMPLATES.promotion.addNew, {
      "Promotion Name": promotionName,
    });
  };

  const isNextOrSaveDisabled = () => {
    const {
      promotionCode,
      promotionTypes,
      discountValue,
      appliesToType,
      minRequirements: {
        reqType,
        reqValues: {minPurchaseAmount, minQuantity},
      },
      locationEligibility,
      usageLimits: {usageType, usageValue},
      activeDays,
      startDate,
      endDate,
      hasEndDate,
    } = newPromoDetails;

    if (props.showProductsAndServicesScreen) {
      return props.itemsCount === 0;
    }

    switch (props.stepInPromotionWizard) {
      case PROMOTION_WIZARD_STEPS.one:
        const isPromotionTypeSelected = promotionTypes.some(
          (promoType) => promoType.active
        );
        return !(promotionCode.trim() && isPromotionTypeSelected);
      case PROMOTION_WIZARD_STEPS.two:
        const activePromoType = promotionTypes.find((promoType) => promoType.active)
          .value;
        if (
          !Number(discountValue) ||
          (activePromoType === "percentage-discount" && discountValue > 100)
        )
          return true;
        else if (appliesToType === "entire-order") return false;
        else if (appliesToType === "specific-items" && props.itemsCount > 0) return false;
        else return true;
      case PROMOTION_WIZARD_STEPS.three:
        if (!reqType) return true;
        else if (reqType === "none") return false;
        else if (reqType === "min-purchase-amount" && Number(minPurchaseAmount))
          return false;
        else if (reqType === "min-quantity" && Number(minQuantity)) return false;
        else return true;
      case PROMOTION_WIZARD_STEPS.four:
        if (!locationEligibility) return true;
        else if (locationEligibility === "any-location") return false;
        else if (props.selectedLocations.length > 0) return false;
        else return true;
      case PROMOTION_WIZARD_STEPS.five:
        if (!usageType) return true;
        else if (usageType !== "multiple-per-customer") return false;
        else if (Number(usageValue) > 1) return false;
        else return true;
      case PROMOTION_WIZARD_STEPS.six:
        if (!startDate || (hasEndDate && !endDate) || activeDays.length === 0)
          return true;
        else return false;
      default:
        return false;
    }
  };

  const handleSetPromotionCode = useCallback(
    (updatedPromoCode) => {
      setNewPromoDetails((prevState) => ({
        ...prevState,
        promotionCode: updatedPromoCode.trim(),
      }));
      props.setNewPromoNameAndDiscountValue({
        ...props.newPromoAndValue,
        name: updatedPromoCode.trim(),
      });
    },
    [props]
  );

  const setPromotionType = useCallback(
    (selectedPromoType) => {
      const {promotionTypes} = newPromoDetails;
      let updatedPromotionTypes = promotionTypes.map((promoType) => {
        return promoType.value === selectedPromoType.value
          ? {...promoType, active: !promoType.active}
          : selectedPromoType.active
          ? {...promoType}
          : {...promoType, active: false};
      });
      const discountValueDescription = selectedPromoType.active
        ? ""
        : selectedPromoType.value === "percentage-discount"
        ? "0% off order total"
        : "$0 off order total";
      setNewPromoDetails((prevState) => ({
        ...prevState,
        promotionTypes: updatedPromotionTypes,
        discountValue: "",
      }));
      props.setNewPromoNameAndDiscountValue({
        ...props.newPromoAndValue,
        discountValue: discountValueDescription,
      });
    },
    [newPromoDetails, props]
  );

  const setDiscountValue = useCallback(
    (enteredDiscountValue) => {
      const updatedDiscountValue = enteredDiscountValue
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*)\./g, "$1");
      setNewPromoDetails((prevState) => ({
        ...prevState,
        discountValue: updatedDiscountValue,
      }));

      const activePromoType = newPromoDetails.promotionTypes.find(
        (promoType) => promoType.active
      ).value;
      const discountValueDescription = Number(updatedDiscountValue)
        ? activePromoType === "percentage-discount"
          ? `${Number(updatedDiscountValue)}% off order total`
          : `$${Number(updatedDiscountValue).toFixed(2)} off order total`
        : activePromoType === "percentage-discount"
        ? "0% off order total"
        : "$0 off order total";
      props.setNewPromoNameAndDiscountValue({
        ...props.newPromoAndValue,
        discountValue: discountValueDescription,
      });
    },
    [newPromoDetails.promotionTypes, props]
  );

  const setAppliesToType = useCallback((updatedAppliesToType) => {
    setNewPromoDetails((prevState) => ({
      ...prevState,
      appliesToType: updatedAppliesToType,
    }));
  }, []);

  const setMinRequirements = useCallback(({value, name}) => {
    setNewPromoDetails((prevState) => {
      if (name === "min-req-option") {
        return {
          ...prevState,
          minRequirements: {...prevState.minRequirements, reqType: value},
        };
      } else {
        return {
          ...prevState,
          minRequirements: {
            ...prevState.minRequirements,
            reqValues: {
              ...prevState.minRequirements.reqValues,
              [name]:
                name === "minPurchaseAmount"
                  ? value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                  : value.replace(/[^0-9]+/g, ""),
            },
          },
        };
      }
    });
  }, []);

  const setLocationEligibility = useCallback((updatedLocationEligibility) => {
    setNewPromoDetails((prevState) => ({
      ...prevState,
      locationEligibility: updatedLocationEligibility,
    }));
  }, []);

  const setUsageLimits = useCallback((updatedUsageValue, updatedUsageType) => {
    setNewPromoDetails((prevState) => {
      return {
        ...prevState,
        usageLimits: {
          ...prevState.usageLimits,
          [updatedUsageType]:
            updatedUsageType === "usageType"
              ? updatedUsageValue
              : updatedUsageValue.replace(/[^0-9]+/g, ""),
        },
      };
    });
  }, []);

  const setActiveDays = useCallback((updatedActiveDays) => {
    setNewPromoDetails((prevState) => ({...prevState, activeDays: updatedActiveDays}));
  }, []);

  const onDateChange = useCallback(({startDate, endDate}) => {
    setNewPromoDetails((prevState) => ({...prevState, startDate, endDate}));
  }, []);

  const onHasEndDateChange = useCallback((updatedHasEndDate) => {
    setNewPromoDetails((prevState) => ({...prevState, hasEndDate: updatedHasEndDate}));
  }, []);

  const renderWizardScreen = () => {
    switch (props.stepInPromotionWizard) {
      case 1:
        return (
          <NewPromotion
            newPromoDetails={newPromoDetails}
            setPromotionCode={handleSetPromotionCode}
            setPromotionType={setPromotionType}
          />
        );
      case 2:
        return (
          <PromotionValue
            newPromoDetails={newPromoDetails}
            setDiscountValue={setDiscountValue}
            setAppliesToType={setAppliesToType}
            showOrHideProductsAndServicesScreen={
              props.showOrHideProductsAndServicesScreen
            }
            showProductsAndServicesScreen={props.showProductsAndServicesScreen}
            resetServicesAndProducts={props.resetServicesAndProducts}
            itemsCount={props.itemsCount}
          />
        );
      case 3:
        return (
          <PromotionMinimumRequirements
            newPromoDetails={newPromoDetails}
            setMinRequirements={setMinRequirements}
          />
        );
      case 4:
        return (
          <PromoLocationEligibility
            newPromoDetails={newPromoDetails}
            setLocationEligibility={setLocationEligibility}
            fetchLocationsList={props.fetchLocationsList}
            allLocations={props.allLocations}
            setSelectedLocation={props.setSelectedLocation}
            selectedLocations={props.selectedLocations}
          />
        );
      case 5:
        return (
          <PromoUsageLimits
            newPromoDetails={newPromoDetails}
            setUsageLimits={setUsageLimits}
          />
        );
      case 6:
        return (
          <PromoActiveDays
            activeDays={newPromoDetails.activeDays}
            startDate={newPromoDetails.startDate}
            endDate={newPromoDetails.endDate}
            hasEndDate={newPromoDetails.hasEndDate}
            setActiveDays={setActiveDays}
            onDateChange={onDateChange}
            onHasEndDateChange={onHasEndDateChange}
          />
        );
      default:
        return <p>Something went wrong</p>;
    }
  };

  const handleNextOrSave = () => {
    if (props.showProductsAndServicesScreen) {
      props.showOrHideProductsAndServicesScreen(false);
      props.calculateItemsCount();
      props.updateServicesAndProductsCopy();
    } else if (props.stepInPromotionWizard === 6) {
      /* Payload creation for  new promotion API*/

      // Promotion Name and Type
      const promotionType = newPromoDetails.promotionTypes.find(
        (promoType) => promoType.active
      ).value;
      const {promotionCode: name} = newPromoDetails;

      // Promo Value
      const discountValue = Number(newPromoDetails.discountValue);
      const {appliesToType} = newPromoDetails;
      let promotionProgramItems;

      if (appliesToType === "specific-items") {
        const {productsList, servicesList} = props;

        const selectedProductsForPromotions = productsList.reduce((acc, product) => {
          if (product.isSelectedForPromotion) {
            acc.push({
              promotionItemId: product.inventoryId,
              promotionItemType: "Inventory",
            });
          }
          return acc;
        }, []);

        const selectedServicesForPromotions = servicesList.reduce((acc, category) => {
          acc.push(
            ...category.services.reduce((acc, service) => {
              if (service.isSelectedForPromotion) {
                acc.push({
                  promotionItemId: service.id,
                  promotionItemType: "ServicesMaster",
                });
              }
              return acc;
            }, [])
          );
          return acc;
        }, []);

        promotionProgramItems = [
          ...selectedProductsForPromotions,
          ...selectedServicesForPromotions,
        ];
      } else if (appliesToType === "entire-order") {
        promotionProgramItems = null;
      }

      // Minimum Requirements
      const {
        reqType: requirementType,
        reqValues: {minPurchaseAmount, minQuantity},
      } = newPromoDetails.minRequirements;
      const requirementValue =
        requirementType === "none"
          ? null
          : requirementType === "min-purchase-amount"
          ? Number(minPurchaseAmount)
          : Number(minQuantity);

      // Location Eligibility

      const {locationEligibility: locationEligibilityType} = newPromoDetails;
      let locationsSelected;
      if (locationEligibilityType === "any-location") {
        locationsSelected = [];
      } else if (locationEligibilityType === "specific-locations") {
        locationsSelected = props.selectedLocations;
      }

      // Usage Limits
      const {
        usageLimits: {usageType, usageValue},
      } = newPromoDetails;
      let customerRedemptionLimit;
      if (usageType === "none") {
        customerRedemptionLimit = 0;
      } else if (usageType === "one-per-customer") {
        customerRedemptionLimit = 1;
      } else if (usageType === "multiple-per-customer") {
        customerRedemptionLimit = Number(usageValue);
      }

      // Active Days and Dates
      const activeDays = newPromoDetails.activeDays.map((activeDay) => ({
        day: activeDay,
      }));
      const {startDate, endDate} = newPromoDetails;

      // Finalizing the payload
      const payload = {
        name,
        promotionType,
        discountValue,
        appliesToType,
        promotionProgramItems,
        requirementType,
        requirementValue,
        locationEligibilityType,
        locationsSelected,
        customerRedemptionLimit,
        activeDays,
        startDate,
        endDate,
      };

      props.createNewPromotion(payload).then((error) => {
        if (!error) {
          trackAddingNewPromotionEvent(payload.name);
        }
      });
    } else {
      props.updateStepCountInWizard(props.stepInPromotionWizard + 1);
    }
  };

  const handleBackClick = () => {
    props.updateStepCountInWizard(props.stepInPromotionWizard - 1);
  };

  return (
    <Fragment>
      {/* BEGIN HEADER */}
      {!props.showProductsAndServicesScreen && (
        <Fragment>
          <div className="locations-card-header wizard-header">
            {props.stepInPromotionWizard > 1 && (
              <div className="back-button-container" onClick={handleBackClick}>
                <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
                <button className="btn btn-text-only cancel-button">Back</button>
              </div>
            )}
            <p>
              {WIZARD_HEADER_AND_PROGRESS_MAPPING[props.stepInPromotionWizard]["header"]}
            </p>
          </div>
          <Progress
            value={
              WIZARD_HEADER_AND_PROGRESS_MAPPING[props.stepInPromotionWizard]["progress"]
            }
            className="_progressbar"
          />
        </Fragment>
      )}
      {/* END HEADER*/}

      <div className="promotions-wizard-body">{renderWizardScreen()}</div>

      {/* ----- BEGIN FOOTER ---- */}
      <div className={`service-prices-footer`}>
        <p className="service-footer-error-message new-service">
          {props.fetchLocationsListError || props.createPromotionError || null}
        </p>
        {!props.showProductsAndServicesScreen && (
          <button
            className="btn btn-text-only cancel-button"
            onClick={() => {
              props.showHideNewPromotionWizard(false);
            }}
          >
            Cancel
          </button>
        )}
        <button
          className="btn-theme btn-rounded save-button"
          onClick={handleNextOrSave}
          disabled={isNextOrSaveDisabled()}
        >
          {props.showProductsAndServicesScreen || props.stepInPromotionWizard === 6
            ? "SAVE"
            : "NEXT"}
        </button>
      </div>
      {/* ----- END FOOTER ---- */}
      {(props.fetchLocationsCallInProgress || props.createPromotionCallInProgress) && (
        <BlockingLoader />
      )}
    </Fragment>
  );
};

PromotionsWizard.propTypes = {
  activePromotionDetails: PropTypes.object,
  activePromotionDetailsUpdateErrors: PropTypes.object,
  activePromotionId: PropTypes.number,
  activePromotionInsights: PropTypes.object,
  activeRoundedTab: PropTypes.string,
  addNewPromotionCallInProgress: PropTypes.bool,
  addNewPromotionError: PropTypes.string,
  allLocations: PropTypes.object,
  allSelected: PropTypes.bool,
  calculateItemsCount: PropTypes.func,
  createNewPromotion: PropTypes.func,
  createPromotionCallInProgress: PropTypes.bool,
  createPromotionError: PropTypes.string,
  customerRedemptionLimitCopy: PropTypes.number,
  fetchLocationsCallInProgress: PropTypes.bool,
  fetchLocationsList: PropTypes.func,
  fetchLocationsListError: PropTypes.string,
  getAllPromotionsCallInProgress: PropTypes.bool,
  hasDetailsEndDate: PropTypes.bool,
  isDetailsProductPickerVisible: PropTypes.bool,
  isInPromotionEditMode: PropTypes.bool,
  isLocationsLoading: PropTypes.bool,
  isPromotionDetailsLoading: PropTypes.bool,
  itemsCount: PropTypes.number,
  locationsError: PropTypes.string,
  newPromoAndValue: PropTypes.object,
  newPromotionName: PropTypes.string,
  newPromotionPriceItems: PropTypes.array,
  numberOfActivePriceUpdates: PropTypes.number,
  productsCallInProgress: PropTypes.bool,
  productsList: PropTypes.array,
  productsListCallError: PropTypes.string,
  productsListCopy: PropTypes.array,
  promotionDetailsError: PropTypes.string,
  promotionDetailsUpdateError: PropTypes.string,
  promotionDetailsUpdateInProgress: PropTypes.bool,
  promotionsList: PropTypes.array,
  promotionsListCopy: PropTypes.array,
  promotionsListError: PropTypes.string,
  resetPromotionsWizardReduxState: PropTypes.func,
  resetServicesAndProducts: PropTypes.func,
  roundedTabs: PropTypes.array,
  searchInProgress: PropTypes.bool,
  searchText: PropTypes.string,
  selectAllProducts: PropTypes.bool,
  selectAllServices: PropTypes.bool,
  selectedLocations: PropTypes.array,
  servicesCallInProgress: PropTypes.bool,
  servicesList: PropTypes.array,
  servicesListCallError: PropTypes.string,
  servicesListCopy: PropTypes.array,
  setNewPromoNameAndDiscountValue: PropTypes.func,
  setSelectedLocation: PropTypes.func,
  showHideNewPromotionWizard: PropTypes.func,
  showNewPromotionWizard: PropTypes.bool,
  showNewPromotionsPricingScreen: PropTypes.bool,
  showOrHideProductsAndServicesScreen: PropTypes.func,
  showProductsAndServicesScreen: PropTypes.bool,
  stepInPromotionWizard: PropTypes.number,
  updateServicesAndProductsCopy: PropTypes.func,
  updateStepCountInWizard: PropTypes.func,
};

export default PromotionsWizard;
