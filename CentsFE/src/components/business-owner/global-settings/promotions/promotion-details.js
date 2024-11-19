// Package Imports
import React, {useEffect} from "react";
import PropTypes from "prop-types";

// Icons Import
import dollarIcon from "../../../../assets/images/dollar.svg";
import hashIcon from "../../../../assets/images/hash_48p.svg";
import personIcon from "../../../../assets/images/person_48p.svg";
import tagIcon from "../../../../assets/images/tag.svg";
import starIcon from "../../../../assets/images/star.svg";
import locationIcon from "../../../../assets/images/location.svg";
import usageLimitIcon from "../../../../assets/images/Icon_Usage_Limits.svg";
import calendarIcon from "../../../../assets/images/calendar.svg";

// Component Imports
import IconInsight from "../../../commons/icon-insight/icon-insight";
import TextField from "../../../commons/textField/textField";
import IconSelect from "../../../commons/icon-select/IconSelect";
import IconDatePicker from "../../../commons/icon-date-picker/icon-date-picker";
import IconDaysPicker from "../../../commons/icon-days-picker/icon-days-picker";
import ServicesAndProducts from "../../../commons/ServicesAndProductsForPromotions/ServicesAndProductsForPromotions";

//Other Imports
import {DROPDOWN_OPTIONS as dropdownOptions} from "./promotions-constants";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import LocationAssignDropdown from "../../../commons/location-assign-dropdown/location-assign-dropdown";
import {formatToThousandRoundedNumber} from "../../../../utils/functions";
import StatusIndicator from "../../../commons/statusIndicator/statusIndicator";
import ToggleSwitch from "../../../commons/toggle-switch/toggleSwitch";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import cx from "classnames";

const PromotionDetails = (props) => {
  const {
    promotionId,
    getPromotionDetails,
    activePromotionDetails,
    customerRedemptionLimitCopy,
    activePromotionInsights,
    isPromotionDetailsLoading,
    promotionDetailsError,
    allLocations,
    toggleServiceProductPicker,
    isDetailsProductPickerVisible,
    resetServicesProductsData,
    handleActivePromoDetailsChange,
    handleHasDetailsEndDateChange,
    hasDetailsEndDate,
    activePromotionDetailsUpdateErrors,
  } = props;
  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    getPromotionDetails(promotionId);
  }, [promotionId, getPromotionDetails]);

  const getUsageLimitType = (usageLimit) => {
    if (usageLimit === 0 || usageLimit === null) {
      return "none";
    } else if (usageLimit === 1) {
      return "one-per-customer";
    } else if (usageLimit > 1) {
      return "multiple-per-customer";
    } else {
      return null;
    }
  };

  const getMinLimitForUsageType = (usageLimitType, currentLimit) => {
    if (usageLimitType === "none") {
      return 0;
    } else if (usageLimitType === "one-per-customer") {
      return 1;
    } else if (usageLimitType === "multiple-per-customer") {
      if (currentLimit > 1) {
        return currentLimit;
      }
      return 2;
    } else {
      return 0;
    }
  };

  const getErrorMessage = () => {
    let errorsCount = 0;
    let combinedErrorString = "";

    for (let key in activePromotionDetailsUpdateErrors) {
      if (activePromotionDetailsUpdateErrors[key]) {
        errorsCount += 1;
        combinedErrorString = combinedErrorString.concat(
          activePromotionDetailsUpdateErrors[key]
        );
      }
    }

    if (errorsCount === 0) {
      return "";
    } else if (errorsCount === 1) {
      return combinedErrorString;
    } else {
      return "Multiple errors occured, please check your data";
    }
  };

  const handleProductPickerSave = () => {
    handleActivePromoDetailsChange(
      promotionId,
      {
        promotionItems: activePromotionDetails.promotionItems.map((item) => {
          return {
            promotionItemId: item.promotionItemId,
            promotionItemType: item.promotionItemType,
          };
        }),
      },
      true
    );
    toggleServiceProductPicker(false); // TODO - Show a loader
  };

  const trackPromotionEvents = (description) => {
    trackEvent(INTERCOM_EVENTS.promotions, description, {
      "Promotion Name": activePromotionDetails.name,
    });
  };

  const renderDetails = () => {
    return (
      <>
        <div className="section insights-section">
          <IconInsight
            icon={dollarIcon}
            value={`$${
              activePromotionInsights?.totalSaved > 999
                ? formatToThousandRoundedNumber(activePromotionInsights?.totalSaved)
                : activePromotionInsights?.totalSaved?.toFixed(2) || "0"
            }`}
            description={"Total Saved by Customers"}
            className="promotion-insight"
          />
          <IconInsight
            icon={hashIcon}
            value={activePromotionInsights?.totalTimesInOrder || 0}
            description={"Times Used"}
            className="promotion-insight short-desc"
          />
          <IconInsight
            icon={personIcon}
            value={activePromotionInsights?.distinctCustomers || 0}
            description={"Total Customers"}
            className="promotion-insight short-desc"
          />
        </div>

        <div className="section details-section">
          <TextField
            label="Promotion Code"
            prefix={<img src={tagIcon} className="text-field-icon" alt={"test"} />}
            isInline={true}
            className="promotions-input"
            value={activePromotionDetails.name}
            onChange={(e) => {
              handleActivePromoDetailsChange(activePromotionDetails.id, {
                name: e.target.value,
              });
            }}
            onBlur={(e) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  name: e.target.value.toUpperCase(),
                },
                true
              );
            }}
            error={activePromotionDetailsUpdateErrors["name"]}
          />

          <IconSelect
            icon={starIcon}
            className="promotions-select"
            isDisabled={true}
            options={dropdownOptions.promotionType}
            value={dropdownOptions.promotionType.find(
              (option) => option.value === activePromotionDetails.promotionType
            )}
          />

          <TextField
            label="Discount Value"
            isInline={true}
            className="promotions-input short-input level-two"
            prefix={
              activePromotionDetails.promotionType === "fixed-price-discount" ? "$" : ""
            }
            suffix={
              activePromotionDetails.promotionType === "percentage-discount" ? "%" : ""
            }
            value={activePromotionDetails.discountValue}
            maxLength={6}
            onChange={(e) => {
              handleActivePromoDetailsChange(activePromotionDetails.id, {
                discountValue: e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*)\./g, "$1"),
              });
            }}
            onBlur={(e) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  discountValue:
                    activePromotionDetails.promotionType === "percentage-discount" &&
                    Number(e.target.value) > 100
                      ? Number(100).toFixed(2)
                      : Number(e.target.value).toFixed(2),
                },
                true
              );
            }}
            error={activePromotionDetailsUpdateErrors["discountValue"]}
          />

          <IconSelect
            icon={starIcon}
            className={cx("promotions-select level-one no-icon", {
              error: activePromotionDetailsUpdateErrors["appliesToType"],
            })}
            options={dropdownOptions.appliesToType}
            value={dropdownOptions.appliesToType.find(
              (option) => option.value === activePromotionDetails.appliesToType
            )}
            onChange={(option) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  appliesToType: option.value,
                },
                true
              );
            }}
          />
          {activePromotionDetails?.appliesToType === "specific-items" && (
            <div
              className={cx("promotions-product-picker level-two no-icon", {
                error: activePromotionDetailsUpdateErrors["promotionItems"],
              })}
              onClick={() => {
                toggleServiceProductPicker(true);
              }}
            >
              <p>
                {activePromotionDetails.promotionItems?.length || 0} item{" "}
                {activePromotionDetails.promotionItems?.length > 1 && "s"} selected
              </p>
            </div>
          )}

          <IconSelect
            icon={starIcon}
            className={cx("promotions-select level-one no-icon", {
              error: activePromotionDetailsUpdateErrors["requirementType"],
            })}
            options={dropdownOptions.minRequirementType}
            value={dropdownOptions.minRequirementType.find(
              (option) => option.value === activePromotionDetails.requirementType
            )}
            onChange={(option) => {
              let additionalParams = {};
              if (option.value === "none" || option.value === "min-quantity") {
                additionalParams.requirementValue = "0";
              } else {
                additionalParams.requirementValue = "0.00";
              }
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  requirementType: option.value,
                  ...additionalParams,
                },
                true
              );
            }}
          />

          {(activePromotionDetails.requirementType === "min-purchase-amount" ||
            activePromotionDetails.requirementType === "min-quantity") && (
            <TextField
              label={`Min. ${
                activePromotionDetails.requirementType === "min-purchase-amount"
                  ? "Amt"
                  : "Qty"
              }`}
              isInline={true}
              prefix={
                activePromotionDetails.requirementType === "min-purchase-amount"
                  ? "$"
                  : ""
              }
              className="promotions-input short-input level-two"
              value={`${activePromotionDetails.requirementValue}`}
              maxLength={
                activePromotionDetails.requirementType === "min-purchase-amount" ? 6 : 3
              }
              onChange={(e) => {
                handleActivePromoDetailsChange(activePromotionDetails.id, {
                  requirementValue:
                    activePromotionDetails.requirementType === "min-quantity"
                      ? e.target.value.replace(/[^0-9]/g, "").replace(/(\..*)\./g, "$1")
                      : e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"),
                });
              }}
              onBlur={(e) => {
                handleActivePromoDetailsChange(
                  activePromotionDetails.id,
                  {
                    requirementValue:
                      activePromotionDetails.requirementType === "min-purchase-amount"
                        ? Number(e.target.value).toFixed(2)
                        : Number(e.target.value),
                  },
                  true
                );
              }}
              error={activePromotionDetailsUpdateErrors["requirementValue"]}
            />
          )}

          <IconSelect
            icon={locationIcon}
            className={cx("promotions-select", {
              error: activePromotionDetailsUpdateErrors["locationEligibilityType"],
            })}
            placeholder={"Select location eligibility type"}
            options={dropdownOptions.locationEligibilityType}
            value={dropdownOptions.locationEligibilityType.find(
              (option) => option.value === activePromotionDetails.locationEligibilityType
            )}
            onChange={(option) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  locationEligibilityType: option.value,
                  storePromotions: [],
                },
                true
              );
            }}
          />

          {activePromotionDetails.locationEligibilityType === "specific-locations" && (
            <LocationAssignDropdown
              allLocations={allLocations}
              selectedLocations={activePromotionDetails.storePromotions.map(
                (store) => store.storeId
              )}
              needsRegions={allLocations?.needsRegions}
              onChange={(newLocations) => {
                handleActivePromoDetailsChange(
                  activePromotionDetails.id,
                  {
                    locationEligibilityType:
                      activePromotionDetails.locationEligibilityType,
                    storePromotions: newLocations.map((newLoc) => {
                      return {storeId: newLoc};
                    }),
                  },
                  true
                );
              }}
              className={cx("promotions-location-assign no-icon level-one", {
                error: activePromotionDetailsUpdateErrors["storePromotions"],
              })}
            />
          )}

          <IconSelect
            icon={usageLimitIcon}
            className={cx("promotions-select", {
              error: activePromotionDetailsUpdateErrors["customerRedemptionLimit"],
            })}
            placeholder={"Select usage limit type"}
            options={dropdownOptions.usageLimitTypes}
            value={dropdownOptions.usageLimitTypes.find(
              (option) =>
                option.value ===
                getUsageLimitType(activePromotionDetails.customerRedemptionLimit)
            )}
            onChange={(option) => {
              let limit = getMinLimitForUsageType(
                option.value,
                activePromotionDetails.customerRedemptionLimit
              );
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  customerRedemptionLimit: limit,
                },
                true
              );
            }}
          />

          {activePromotionDetails.customerRedemptionLimit > 1 && (
            <TextField
              label="# of Uses"
              isInline={true}
              className="promotions-input short-input level-two"
              value={customerRedemptionLimitCopy}
              maxLength={3}
              onChange={(e) => {
                handleActivePromoDetailsChange(activePromotionDetails.id, {
                  customerRedemptionLimit: e.target.value
                    .replace(/[^0-9]/g, "")
                    .replace(/(\..*)\./g, "$1"),
                });
              }}
              onBlur={(e) => {
                handleActivePromoDetailsChange(
                  activePromotionDetails.id,
                  {
                    customerRedemptionLimit: Number(e.target.value),
                  },
                  true
                );
              }}
              error={activePromotionDetailsUpdateErrors["customerRedemptionLimit"]}
            />
          )}

          <IconDatePicker
            icon={calendarIcon}
            hasEndDate={hasDetailsEndDate}
            startDate={activePromotionDetails.startDate}
            endDate={activePromotionDetails.endDate}
            onDateChange={(datesObj) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  startDate: datesObj.startDate,
                  endDate: datesObj.endDate,
                },
                true
              );
            }}
            onHasEndDateChange={(hasEndDate) => {
              handleHasDetailsEndDateChange(activePromotionDetails.id, hasEndDate);
            }}
            className={cx("promotions-date-picker", {
              error:
                activePromotionDetailsUpdateErrors["startDate"] ||
                activePromotionDetailsUpdateErrors["endDate"],
            })}
            numberOfMonths={1}
          />

          <IconDaysPicker
            activeDays={activePromotionDetails.activeDays.map((day) => day.day)}
            showMenuAtBottom={false}
            hideIcon={true}
            className={cx("promotions-day-picker level-one", {
              error: activePromotionDetailsUpdateErrors["activeDays"],
            })}
            onActiveDaysChange={(daysSelected) => {
              handleActivePromoDetailsChange(
                activePromotionDetails.id,
                {
                  activeDays: daysSelected.map((day) => {
                    return {day: day};
                  }),
                },
                true
              );
            }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      {isDetailsProductPickerVisible ? (
        <div className={"details-service-product-root"}>
          <div className={"details-service-product-container"}>
            <ServicesAndProducts
              onClose={() => {
                toggleServiceProductPicker(false);
              }}
              isDetails={true}
              resetPromotionsServiceProducts={resetServicesProductsData}
            />
          </div>
          <div className={"details-service-prices-footer"}>
            <button
              className={"btn-theme btn-rounded"}
              onClick={() => {
                handleProductPickerSave();
              }}
            >
              SAVE
            </button>
          </div>
        </div>
      ) : isPromotionDetailsLoading ? (
        <BlockingLoader />
      ) : promotionDetailsError ? (
        <p>{promotionDetailsError}</p>
      ) : (
        activePromotionDetails && (
          <>
            <div className="locations-card-header">
              <p>{activePromotionDetails.name}</p>
            </div>
            <div className="locations-card-content">
              <div className="location-info-container services-tablayout-container promotions-info-container">
                <div className="scroll-area">{renderDetails()}</div>
                <div className="promotion-details-footer">
                  <StatusIndicator
                    status={activePromotionDetails.active ? "paired" : "inactive"}
                  />
                  <p>{activePromotionDetails.active ? "ACTIVE" : "INACTIVE"}</p>
                  <ToggleSwitch
                    checked={activePromotionDetails.active}
                    onChange={(value) => {
                      handleActivePromoDetailsChange(
                        activePromotionDetails.id,
                        {
                          active: value,
                        },
                        true
                      );
                      trackPromotionEvents(
                        value
                          ? INTERCOM_EVENTS_TEMPLATES.promotion.activate
                          : INTERCOM_EVENTS_TEMPLATES.promotion.deactivate
                      );
                    }}
                  />

                  <p className="error-text" title={getErrorMessage()}>
                    {getErrorMessage()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </>
  );
};
PromotionDetails.propTypes = {
  activePromotionDetails: PropTypes.object,
  activePromotionDetailsUpdateErrors: PropTypes.object,
  activePromotionId: PropTypes.number,
  activePromotionInsights: PropTypes.object,
  activeRoundedTab: PropTypes.string,
  addNewPromotionCallInProgress: PropTypes.bool,
  addNewPromotionError: PropTypes.string,
  allLocations: PropTypes.object,
  createPromotionCallInProgress: PropTypes.bool,
  createPromotionError: PropTypes.string,
  customerRedemptionLimitCopy: PropTypes.number,
  fetchLocationsCallInProgress: PropTypes.bool,
  fetchLocationsListError: PropTypes.string,
  getAllPromotionsCallInProgress: PropTypes.bool,
  getPromotionDetails: PropTypes.func,
  handleActivePromoDetailsChange: PropTypes.func,
  handleHasDetailsEndDateChange: PropTypes.func,
  hasDetailsEndDate: PropTypes.bool,
  isDetailsProductPickerVisible: PropTypes.bool,
  isInPromotionEditMode: PropTypes.bool,
  isLocationsLoading: PropTypes.bool,
  isPromotionDetailsLoading: PropTypes.bool,
  itemsCount: PropTypes.number,
  locationsError: PropTypes.string,
  newPromoAndValue: PropTypes.object,
  newPromotionName: PropTypes.string,
  numberOfActivePriceUpdates: PropTypes.number,
  productsCallInProgress: PropTypes.bool,
  productsList: PropTypes.array,
  productsListCallError: PropTypes.string,
  productsListCopy: PropTypes.array,
  promotionDetailsError: PropTypes.string,
  promotionDetailsUpdateError: PropTypes.string,
  promotionDetailsUpdateInProgress: PropTypes.bool,
  promotionId: PropTypes.number,
  promotionsList: PropTypes.array,
  promotionsListCopy: PropTypes.array,
  promotionsListError: PropTypes.string,
  resetServicesProductsData: PropTypes.func,
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
  showNewPromotionWizard: PropTypes.bool,
  showNewPromotionsPricingScreen: PropTypes.bool,
  showProductsAndServicesScreen: PropTypes.bool,
  stepInPromotionWizard: PropTypes.number,
  toggleServiceProductPicker: PropTypes.func,
};

export default PromotionDetails;
