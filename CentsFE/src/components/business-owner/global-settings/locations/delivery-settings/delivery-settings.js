import React, {useEffect, useState} from "react";

import clockIcon from "../../../../../assets/images/clock.svg";
import washFoldIcon from "../../../../../assets/images/price-wash-fold.svg";
import regionIcon from "../../../../../assets/images/region-district-account-settings.svg";
import deliveryIcon from "../../../../../assets/images/delivery.svg";
import dollarIcon from "../../../../../assets/images/dollar-price.svg";
import vectorIcon from "../../../../../assets/images/Vector.svg";
import hoursVectorIcon from "../../../../../assets/images/hours-vector.svg";
import notesIcon from "../../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import {deliveryWizardTypes, editableDeliveryScreenTypes} from "../constants";
import {
  updateDeliverySettings,
  updateOwnDriverDeliverySettings,
  updateOnDemandDeliverySettings,
} from "../../../../../api/business-owner/delivery-settings";
import {centsToDollarsDisplay} from "../utils/location";
import {convertTo12Hours} from "../../../../commons/time-picker/utils";
import {SHORT_WEEK_DAYS} from "../common/shifts-tab/constants";

import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import DeliverySettingsToggleErrorPopup from "./delivery-settings-toggle-error-popup";
import {ServicePricingOption} from "../constants";
import isEmpty from "lodash/isEmpty";
import SubsidyInformation from "./subsidy-information";
import {Link} from "react-router-dom";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

const DeliverySettingsWizard = (props) => {
  const {
    // State
    deliverySettings,
    deliverySettingsApiError,
    deliverySettingsLoading,
    location,
    flags,
    // Dispatch
    fetchDeliverySettings,
    setDeliveryWizard,
    setEditableDeliveryScreen,
  } = props;

  const {
    generalDeliverySettings = {},
    ownDriverDeliverySettings = {},
    onDemandDeliverySettings = {},
    canEnableDeliverySettings = true,
  } = deliverySettings || {};

  const {
    turnAroundInHours = 0,
    servicesSelected = 0,
    deliveryPriceType,
    deliveryTier,
    recurringDiscountInPercent,
    customLiveLinkHeader,
    customLiveLinkMessage,
  } = generalDeliverySettings;
  const {
    hasZones,
    zipCodes = [],
    zones = [],
    deliveryWindowBufferInHours,
  } = ownDriverDeliverySettings;
  const {
    deliveryFeeInCents = 0,
    returnDeliveryFeeInCents = 0,
    windows = [],
  } = ownDriverDeliverySettings;
  const {
    windows: onDemandWindows = [],
    subsidyInCents: subsidy = 0,
    returnOnlySubsidyInCents: returnOnlySubsidy = 0,
  } = onDemandDeliverySettings;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliverySettings(location.id);
  }, [fetchDeliverySettings, location.id]);

  const [offerDeliveryEnabled, setOfferDeliveryEnabled] = useState(false);
  const [ownDeliveryEnabled, setOwnDeliveryEnabled] = useState(false);
  const [onDemandDeliveryEnabled, setOnDemandDeliveryEnabled] = useState(false);
  const [settingsToggleErrorData, setSettingsToggleErrorData] = useState(false);

  useEffect(() => {
    setOfferDeliveryEnabled(
      generalDeliverySettings && generalDeliverySettings.deliveryEnabled
    );
  }, [generalDeliverySettings]);

  useEffect(() => {
    setOwnDeliveryEnabled(
      ownDriverDeliverySettings &&
        ownDriverDeliverySettings.id &&
        ownDriverDeliverySettings.active
    );
  }, [ownDriverDeliverySettings]);

  useEffect(() => {
    setOnDemandDeliveryEnabled(
      onDemandDeliverySettings &&
        onDemandDeliverySettings.id &&
        onDemandDeliverySettings.active
    );
  }, [onDemandDeliverySettings]);

  const updateDeliverySettingsActiveStatus = async (payload) => {
    try {
      setLoading(true);
      setError();
      const res = await updateDeliverySettings(location.id, payload);
      if (res?.data?.success) {
        await fetchDeliverySettings(location.id);
      }
      if (isEmpty(ownDriverDeliverySettings) && isEmpty(onDemandDeliverySettings)) {
        payload?.deliveryEnabled &&
          setDeliveryWizard(deliveryWizardTypes.DELIVERY_SETTINGS_ENABLED);
      }
      setOfferDeliveryEnabled(!offerDeliveryEnabled);
    } catch (error) {
      if (error?.response?.data?.type === "ACTIVE_DELIVERIES_OR_SUBSCRIPTIONS") {
        setSettingsToggleErrorData({
          ...error?.response?.data,
          type: "Delivery Settings",
        });
      } else {
        setError(
          error?.response?.data?.error || "Could not update delivery active status"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const generalDeliverySettingsChecked = () => {
    setError();
    updateDeliverySettingsActiveStatus({
      deliveryEnabled: !offerDeliveryEnabled,
    });
  };

  const ownDriverDeliverySettingsChecked = async () => {
    setError();
    if (ownDriverDeliverySettings?.id) {
      try {
        setLoading(true);
        setOwnDeliveryEnabled(!ownDeliveryEnabled);
        await updateOwnDriverDeliverySettings(location.id, {active: !ownDeliveryEnabled});
      } catch (error) {
        // If API fails, revert the state back.
        setOwnDeliveryEnabled(ownDeliveryEnabled);
        if (error?.response?.data?.type === "ACTIVE_DELIVERIES_OR_SUBSCRIPTIONS") {
          setSettingsToggleErrorData({
            ...error?.response?.data,
            type: "Own Driver Settings",
          });
        } else {
          setError(
            error?.response?.data?.error ||
              "Could not toggle the own driver delivery status."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      setDeliveryWizard(deliveryWizardTypes.OWN_DELIVERY_SETTINGS);
    }
  };

  const onDemandDeliverySettingsChecked = async () => {
    if (onDemandDeliverySettings?.id) {
      try {
        setLoading(true);
        setOnDemandDeliveryEnabled(!onDemandDeliveryEnabled);
        await updateOnDemandDeliverySettings(location.id, {
          active: !onDemandDeliveryEnabled,
        });
      } catch (error) {
        // If API fails, revert the state back.
        setOnDemandDeliveryEnabled(onDemandDeliveryEnabled);
        if (error?.response?.data?.type === "ACTIVE_DELIVERIES_OR_SUBSCRIPTIONS") {
          setSettingsToggleErrorData({
            ...error?.response?.data,
            type: "On Demand Settings",
          });
        } else {
          setError(
            error?.response?.data?.error ||
              "Could not toggle the own driver delivery status."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      setDeliveryWizard(deliveryWizardTypes.ON_DEMAND_DELIVERY_SETTINGS);
    }
  };

  const buildTimingDisplay = (timing) => {
    const endTime =
      timing.endTime && new Date(timing.endTime).getUTCDate() !== 1
        ? `${convertTo12Hours(timing.endTime)}(+1)`
        : convertTo12Hours(timing.endTime);

    const times = [convertTo12Hours(timing.startTime), endTime].join(" - ");

    const days =
      timing.startDay === timing.endDay
        ? SHORT_WEEK_DAYS[timing.endDay]
        : [SHORT_WEEK_DAYS[timing.startDay], SHORT_WEEK_DAYS[timing.endDay]].join(" - ");

    return endTime ? `${times}, ${days}` : "";
  };

  const requiredFieldSymbol = (text) => {
    return (
      <div className="text-warning-mark-container">
        <p className="no-data-text">{text}</p>
        <div className="warning-mark"></div>
      </div>
    );
  };

  const areGeneralDeliverySettingsConfigured = () => {
    const areGeneralDeliverySettingsConfiguredBoolean = flags.cents20
      ? !(
          (deliveryPriceType === ServicePricingOption.storeRetailPricingOption &&
            servicesSelected) ||
          (deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
            (!isEmpty(deliveryTier) ||
              (!isEmpty(zones) && zones?.every((zone) => zone?.deliveryTier?.id))))
        )
      : !(
          ((deliveryPriceType === ServicePricingOption.storeRetailPricingOption &&
            servicesSelected) ||
            (deliveryPriceType === ServicePricingOption.deliveryTierPricing &&
              (!isEmpty(deliveryTier) ||
                (!isEmpty(zones) && zones?.every((zone) => zone?.deliveryTier?.id))))) &&
          turnAroundInHours
        );
    return areGeneralDeliverySettingsConfiguredBoolean;
  };

  const handleEditDeliverySettingsScreen = (wizardType) => {
    setEditableDeliveryScreen(wizardType);
  };

  const formatDeliveryBufferSummary = (deliveryWindowBufferInHours) => {
    if (!deliveryWindowBufferInHours) {
      return requiredFieldSymbol("No Buffer Added");
    }

    if (deliveryWindowBufferInHours === 1) {
      return <p>{deliveryWindowBufferInHours} hour buffer</p>;
    }

    if (deliveryWindowBufferInHours < 1) {
      return <p>{Math.round(deliveryWindowBufferInHours * 60) || 0} minutes buffer</p>;
    }

    return <p>{deliveryWindowBufferInHours} hours buffer</p>;
  };

  const handleOnSubsidyClick = () => {
    handleEditDeliverySettingsScreen(editableDeliveryScreenTypes.DELIVERY_SUBSIDY);
  };

  return (
    <>
      {(loading || deliverySettingsLoading) && <BlockingLoader />}
      <div className="delivery-settings-container">
        {settingsToggleErrorData ? (
          <DeliverySettingsToggleErrorPopup
            settingsToggleErrorData={settingsToggleErrorData}
            setSettingsToggleErrorData={setSettingsToggleErrorData}
          />
        ) : null}
        <div className="offer-your-customers-content">
          <p className="bold-content">
            Offer your customers more ways to get their laundry done.
          </p>
          <p>
            Setting up your delivery on Cents is easy. Establish delivery pricing, set
            your services, and turn on delivery with your own drivers, on-demand delivery
            with Cents’ rideshare partners, or offer both!
          </p>
        </div>
        {deliverySettingsApiError ? (
          <div className="error-message m-auto text-center">
            {deliverySettingsApiError}
          </div>
        ) : (
          <>
            {error && <div className="error-message m-auto text-center">{error}</div>}
            <div>
              <div className="offer-toggle-container">
                <div className="spacer"></div>
                <span>Offer pickup & delivery service at this store</span>
                <ToggleSwitch
                  onChange={generalDeliverySettingsChecked}
                  checked={offerDeliveryEnabled}
                  className="offer-toggle"
                  disabled={!canEnableDeliverySettings}
                />
              </div>
              {!canEnableDeliverySettings && (
                <div className="delivery-offers-warning-container">
                  <span>Note:</span>
                  <p>
                    Please connect your bank account in your{" "}
                    <Link
                      to={"/global-settings/account/payments"}
                      className={"account-settings-nav"}
                    >
                      Account Settings
                    </Link>{" "}
                    before enabling pickup and delivery service.
                  </p>
                </div>
              )}
              {offerDeliveryEnabled && (
                <div>
                  {areGeneralDeliverySettingsConfigured() && (
                    <div className="delivery-offers-warning-container">
                      <span>Warning:</span>
                      {flags.cents20 ? (
                        <p>
                          Service pricing and availability must be set in order to offer
                          pickup & delivery at this store.
                        </p>
                      ) : (
                        <p>
                          Service pricing, service availability, and turnaround time must
                          be set in order to offer pickup & delivery at this store.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="delivery-offers-container">
                    <span>Service Availability & Pricing</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={washFoldIcon} alt="wash" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.DELIVERY_SERVICES
                        )
                      }
                    >
                      {servicesSelected ||
                      !isEmpty(deliveryTier) ||
                      zones.every((zone) => zone?.deliveryTier) ? (
                        deliveryPriceType === ServicePricingOption.deliveryTierPricing ? (
                          ownDeliveryEnabled && hasZones ? (
                            <p className="link-text">
                              Delivery tier{zones?.length > 1 ? "s" : ""} set per{" "}
                              {zones?.length || 0} zone
                              {zones?.length > 1 ? "s" : ""}
                            </p>
                          ) : (
                            <p>Delivery tiers: {deliveryTier?.name || ""}</p>
                          )
                        ) : (
                          <p>{servicesSelected || 0} services offered</p>
                        )
                      ) : (
                        requiredFieldSymbol("No services selected")
                      )}
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <span>Recurring Delivery Discount</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={vectorIcon} alt="clock" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.RECURRING_DISCOUNT
                        )
                      }
                    >
                      {recurringDiscountInPercent ? (
                        <p>{recurringDiscountInPercent || 0}% Off</p>
                      ) : (
                        <p className="no-data-text">No Recurring Delivery Discount</p>
                      )}
                    </div>
                  </div>
                  {flags.cents20 ? null : (
                    <>
                      <div className="delivery-offers-container">
                        <span>Turnaround Time</span>
                      </div>
                      <div className="delivery-offers-container">
                        <img src={clockIcon} alt="clock" />
                        <div
                          onClick={() =>
                            handleEditDeliverySettingsScreen(
                              editableDeliveryScreenTypes.TURNAROUND_TIME
                            )
                          }
                        >
                          {turnAroundInHours ? (
                            <p>{turnAroundInHours || 0} hr minimum turnaround</p>
                          ) : (
                            requiredFieldSymbol("No Turnaround Time Added")
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="delivery-offers-container">
                    <span>Custom Message for Customers</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={notesIcon} alt="notes" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.CUSTOM_MESSAGE
                        )
                      }
                    >
                      <p className="data-header">{customLiveLinkHeader}</p>
                      <p className="data-message">{customLiveLinkMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              {offerDeliveryEnabled && (
                <div className="offer-toggle-container">
                  <div className="spacer"></div>
                  <span>I have my own drivers</span>
                  <ToggleSwitch
                    onChange={ownDriverDeliverySettingsChecked}
                    checked={ownDeliveryEnabled}
                    className="offer-toggle"
                  />
                </div>
              )}
              {ownDeliveryEnabled && offerDeliveryEnabled ? (
                <>
                  <div className="delivery-offers-container">
                    <span>Service Area</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={regionIcon} alt="region" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.SERVICE_AREA
                        )
                      }
                      className="zones-and-zip-codes-container"
                    >
                      {hasZones ? (
                        <p className="link-text">
                          {zones?.length} Zone{`${zones?.length > 1 ? "s" : ""}`}{" "}
                        </p>
                      ) : (
                        zipCodes?.join(", ") || "N/A"
                      )}
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <span>Pickup & Delivery Windows</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={deliveryIcon} alt="delivery" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_WINDOWS
                        )
                      }
                    >
                      {windows && windows.length ? (
                        windows?.map((timing) => {
                          const timingDisplay = buildTimingDisplay(timing);

                          return (
                            <p
                              key={`${timing.startDay}-${timing.endDay}-${location.id}`}
                              title={timingDisplay}
                            >
                              {timingDisplay}
                            </p>
                          );
                        })
                      ) : (
                        <p>No Windows</p>
                      )}
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <span>Pickup & Delivery Fee Settings</span>
                  </div>
                  <div className="delivery-offers-container">
                    <div className="online-order-fee-summary">
                      <span>For pickup & delivery - online orders</span>
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <div className="online-order-fee-summary">
                      <img src={dollarIcon} alt="price" />
                      <div
                        onClick={() =>
                          handleEditDeliverySettingsScreen(
                            editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_FEE
                          )
                        }
                      >
                        {deliveryFeeInCents ? (
                          <p>
                            {centsToDollarsDisplay(deliveryFeeInCents)} Delivery Fee (
                            {centsToDollarsDisplay(deliveryFeeInCents / 2)} each way)
                          </p>
                        ) : (
                          <p>Free Pickup and Delivery</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <div className="online-order-fee-summary">
                      <span>For return delivery only - walk-in orders</span>
                    </div>
                  </div>
                  <div className="delivery-offers-container">
                    <div className="online-order-fee-summary">
                      <img src={dollarIcon} alt="price" />
                      <div
                        onClick={() =>
                          handleEditDeliverySettingsScreen(
                            editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_FEE
                          )
                        }
                      >
                        {returnDeliveryFeeInCents ? (
                          <p>
                            {centsToDollarsDisplay(returnDeliveryFeeInCents)} Delivery Fee
                          </p>
                        ) : (
                          <p>Free Delivery</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <>
                    <div className="delivery-offers-container">
                      <span>Pickup / Delivery Buffer</span>
                    </div>
                    <div className="delivery-offers-container">
                      <img src={clockIcon} alt="clock" />
                      <div
                        onClick={() =>
                          handleEditDeliverySettingsScreen(
                            editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_BUFFER
                          )
                        }
                      >
                        {formatDeliveryBufferSummary(deliveryWindowBufferInHours)}
                      </div>
                    </div>
                  </>
                </>
              ) : null}

              {offerDeliveryEnabled && (
                <div className="offer-toggle-container">
                  <div className="spacer"></div>
                  <span> I will use a Cents on-demand pickup & delivery partner</span>
                  <ToggleSwitch
                    onChange={onDemandDeliverySettingsChecked}
                    checked={onDemandDeliveryEnabled}
                    className="offer-toggle"
                  />
                </div>
              )}
              {onDemandDeliveryEnabled && offerDeliveryEnabled && (
                <>
                  <div className="delivery-offers-container">
                    <span>Pickup & Dropoff Hours</span>
                  </div>
                  <div className="delivery-offers-container">
                    <img src={hoursVectorIcon} alt="delivery" />
                    <div
                      onClick={() =>
                        handleEditDeliverySettingsScreen(
                          editableDeliveryScreenTypes.PICKUP_AND_DROPOFF_HOURS
                        )
                      }
                    >
                      {onDemandWindows && onDemandWindows.length ? (
                        onDemandWindows?.map((timing) => {
                          const timingDisplay = buildTimingDisplay(timing);

                          return (
                            <p
                              key={`${timing.startDay}-${timing.endDay}-${location.id}`}
                              title={timingDisplay}
                            >
                              {timingDisplay}
                            </p>
                          );
                        })
                      ) : (
                        <p>No Windows</p>
                      )}
                    </div>
                  </div>

                  <div className="delivery-offers-container">
                    <span>On-Demand Subsidy Settings</span>
                  </div>
                  <SubsidyInformation
                    subsidy={subsidy}
                    text="pickup & delivery - online"
                    showEachWayText
                    handleOnClick={handleOnSubsidyClick}
                  />
                  <SubsidyInformation
                    subsidy={returnOnlySubsidy}
                    text="return delivery - walk-in"
                    handleOnClick={handleOnSubsidyClick}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default withLDConsumer()(DeliverySettingsWizard);
