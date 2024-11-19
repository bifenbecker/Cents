import React, {useEffect, useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import isEmpty from "lodash/isEmpty";

import taxPercentageIcon from "../../../../assets/images/Icon_Tax_Percentage.svg";
import cashCardIcon from "../../../../assets/images/Icon_Cash_Card.svg";
// import cautionIcon from '../../../../assets/images/Icon_Caution.svg';
import locationIcon from "../../../../assets/images/location.svg";
import keyIcon from "../../../../assets/images/Icon_Key.svg";
import clockIcon from "../../../../assets/images/clock.svg";
import hashIcon from "../../../../assets/images/hash.svg";

import {buildTaxRateOptions, findSelectedTaxRate} from "./utils/tax-rate";
import {convertTo12Hours} from "../../../../utils/businessOwnerUtils";
import {SHORT_WEEK_DAYS} from "./common/shifts-tab/constants";
import {ProcessingType} from "./constants";

import TextField from "../../../commons/textField/textField";
import MaterialSelect from "../../../commons/select/select";
import ToggleSwitch from "../../../commons/toggle-switch/toggleSwitch";
import LocationAssignDropdown from "../../../commons/location-assign-dropdown/location-assign-dropdown";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";

const LocationDetails = (props) => {
  const {
    locationList,
    needsRegions,
    taxRatesList,
    editLocation,
    addNewTaxRate,
    updateHubSetting,
    selectedLocation,
    handleSaveTaxRate,
    regionsWithOutHub,
    // updateBagTracking,
    updateIsIntakeOnly,
    locationsWithOutHub,
    showHideShiftsScreen,
    taxUpdateCallInProgress,
    showEsdRegistrationScreen,
    isWithOutHubCallInProgress,
    handleSelectedLocationInlineSave,
    updateIsResidential,
    updateLocationSettings,
    processingUpdateCallInProgress,
  } = props;

  const [location, setLocation] = useState({...selectedLocation});
  const [errorFields, setErrorFields] = useState({
    dcaLicense: false,
    taxRate: false,
    processing: false,
  });

  useEffect(() => {
    setLocation({...selectedLocation});
  }, [selectedLocation]);

  // const locationHub = useMemo(() => {
  //   return location.hubId
  //     ? locationList.find((loc) => loc.id === location.hubId)
  //     : null;
  // }, [location.hubId, locationList]);

  const setLocationField = (field, value) => {
    setLocation((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const setFieldError = (field, value = true) => {
    setErrorFields({...errorFields, [field]: value});
  };

  const getHubToggleDisabledMessage = useMemo(() => {
    if (location.hubId) {
      let hub = locationList.find((loc) => loc.id === location.hubId);
      return `This location is already served by the ${hub?.address} hub and cannot be made a hub itself.`;
    } else if (location.locationsServed && location.locationsServed?.length > 0) {
      return `Unassign served locations to disable hub status.`;
    } else {
      return "";
    }
  }, [location, locationList]);

  const taxRatesOptions = useMemo(() => buildTaxRateOptions(taxRatesList), [
    taxRatesList,
  ]);

  const selectedTaxRateOption = useMemo(() => {
    return findSelectedTaxRate(taxRatesOptions, location.taxRate);
  }, [location.taxRate, taxRatesOptions]);

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

    return `${times}, ${days}`;
  };
  return (
    <>
      {(taxUpdateCallInProgress || processingUpdateCallInProgress) && <BlockingLoader />}
      {/* <div className="location-summary row">
        <div>
          <div className="washer-count counts-item">
            <img src={washerIcon} alt="washer" />
            <div>
              <p>18</p>
              <p>Washers</p>
            </div>
          </div>
          <div className="dryer-count counts-item">
            <img src={dryerIcon} alt="dryer" />
            <div>
              <p>22</p>
              <p>Dryers</p>
            </div>
          </div>
          <div className="revenue counts-item">
            <img src={dollarIcon} alt="dollar" />
            <div>
              <p>$10k</p>
              <p>Revenue this week</p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="location-details row">
        <div>
          <div className="address-container">
            <img src={locationIcon} alt="locations" />
            <div
              onClick={() => {
                editLocation(location);
              }}
              className="address-details"
            >
              <p title={location.name}>{location.name}</p>
              <p title={location.address}>{location.address}</p>
              <p title={`${location.city}, ${location.state} ${location.zipCode}`}>
                {location.city}, {location.state} {location.zipCode}
              </p>
            </div>
          </div>
          <div className="store-hours-container">
            <img src={clockIcon} alt="clock" />
            {location.timings && location.timings.length > 0 ? (
              <div onClick={() => showHideShiftsScreen(true, location.id)}>
                {location.timings.map((timing) => {
                  const timingDisplay = buildTimingDisplay(timing);

                  return (
                    <p
                      key={`${timing.startDay}-${timing.endDay}-${location.id}`}
                      title={timingDisplay}
                    >
                      {timingDisplay}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div>
                <p
                  className="set-location-shifts-cta"
                  onClick={() => showHideShiftsScreen(true, location.id)}
                >
                  Set location shifts &gt;
                </p>
              </div>
            )}
          </div>
          <div className="tax-rate-container dca-number-field">
            <img src={hashIcon} alt="hash" className="hash-icon" />
            <TextField
              isInline
              label="DCA Number - Retail"
              className="location-input"
              value={location.dcaLicense || ""}
              onChange={(e) => {
                setLocationField("dcaLicense", e.target.value);
              }}
              error={errorFields.dcaLicense}
              maxLength={15}
              onBlur={(e) => {
                handleSelectedLocationInlineSave(
                  setFieldError,
                  selectedLocation,
                  "dcaLicense",
                  e.target.value
                );
              }}
            />
          </div>
          <div className="tax-rate-container dca-number-field">
            <img src={hashIcon} alt="hash" className="hash-icon" />
            <TextField
              isInline
              label="DCA Number - Commercial"
              className="location-input"
              value={location.commercialDcaLicense || ""}
              onChange={(e) => {
                setLocationField("commercialDcaLicense", e.target.value);
              }}
              error={errorFields.dcaLicense}
              maxLength={15}
              onBlur={(e) => {
                handleSelectedLocationInlineSave(
                  setFieldError,
                  selectedLocation,
                  "commercialDcaLicense",
                  e.target.value
                );
              }}
            />
          </div>
          <div className="tax-rate-container">
            <img src={taxPercentageIcon} alt="icon" />
            <MaterialSelect
              className="locations-tax-rate-dropdown"
              isInline={true}
              label="Tax Rate"
              value={selectedTaxRateOption}
              options={taxRatesOptions}
              maxMenuHeight={175}
              menuShouldScrollIntoView={true}
              error={errorFields.taxRate}
              onChange={(selectedOption) => {
                if (selectedOption.value === "new-tax-rate") {
                  addNewTaxRate();
                } else {
                  handleSaveTaxRate(
                    setFieldError,
                    selectedLocation,
                    selectedOption.value,
                    taxRatesList
                  );
                }
              }}
            />
          </div>
          <div className="hub-settings-container">
            <div className="hub-toggle-container">
              <img src={keyIcon} alt="hub" />
              <span>This is a hub</span>
              <ToggleSwitch
                onChange={(v) => {
                  updateHubSetting(location, v, []);
                }}
                checked={location.isHub}
                className="hub-toggle"
                disabled={location.hubId != null || location.locationsServed?.length > 0}
              />
              <p className="hub-toggled-disabled-message">
                {getHubToggleDisabledMessage}
              </p>
            </div>
            {location.isHub ? (
              <div className="hub-locations-container">
                <p className="location-title-margin">
                  Serves these locations:
                  {isWithOutHubCallInProgress ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : null}
                </p>
                <LocationAssignDropdown
                  allLocations={{
                    locations: locationsWithOutHub,
                    regions: regionsWithOutHub,
                  }}
                  selectedLocations={location.locationsServed}
                  needsRegions={needsRegions}
                  onChange={(value) => {
                    updateHubSetting(location, location.isHub, value);
                  }}
                />
              </div>
            ) : null}

            {/* Bag Tracking functionality */}

            {/* {location.isHub ? (
              <div className="hub-toggle-container">
                <div className="spacer"></div>
                <span>Bag Tracking</span>
                <ToggleSwitch
                  onChange={(v) => {
                    updateBagTracking(location, v);
                  }}
                  checked={location.isBagTrackingEnabled}
                  className="hub-toggle"
                />
                <p className="hub-toggled-disabled-message black">
                  {location.isBagTrackingEnabled
                    ? "Turned on for all locations served by this hub."
                    : null}
                </p>
              </div>
            ) : null}

            {location.isBagTrackingEnabled &&
              !location.isHub &&
              location.hubId && (
                <div className="bag-tracking-spoke-message-container">
                  <div className="spacer"></div>
                  <p className="bag-tracking-spoke-message black">
                    {`Bag Tracking is turned on at this location because it is served by the ${locationHub?.address} hub which requires Bag Tracking.`}
                  </p>
                  <img src={cautionIcon} alt="caution" />
                </div>
              )} */}

            {!location.isHub && location.hubId && (
              <div className="hub-toggle-container">
                <div className="spacer"></div>
                <span>Intake Only</span>
                <ToggleSwitch
                  onChange={(v) => {
                    updateIsIntakeOnly(location, v);
                  }}
                  checked={
                    location.type === "INTAKE_ONLY" || location.type === "RESIDENTIAL"
                  }
                  className="hub-toggle"
                />
              </div>
            )}

            {!location.isHub &&
            location.hubId &&
            (location.type === "INTAKE_ONLY" || location.type === "RESIDENTIAL") ? (
              <div className="hub-toggle-container">
                <div className="spacer double-spacer"></div>
                <span>Residential</span>
                <ToggleSwitch
                  onChange={(v) => {
                    updateIsResidential(location, v);
                  }}
                  checked={location.type === "RESIDENTIAL"}
                  className="hub-toggle"
                />
              </div>
            ) : null}

            {((location.hasEsdEnabled && !isEmpty(location.esdReader)) ||
              (location.hasCciEnabled && !isEmpty(location.cciSettings)) ||
              (location.hasLaundroworksEnabled &&
                !isEmpty(location.laundroworksSettings))) && (
              <div className="esd-container">
                <img src={cashCardIcon} alt="cash card icon" />
                <div>
                  <p>
                    {location.hasEsdEnabled
                      ? "ESD"
                      : location.hasCciEnabled
                      ? "CCI"
                      : "Laundroworks"}{" "}
                    Cash Card Integration
                  </p>
                  <p
                    className="hyperlink"
                    onClick={() => {
                      showEsdRegistrationScreen(true);
                    }}
                  >
                    Connected
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {location?.type === "RESIDENTIAL" ? null : (
          <div className="processing-container">
            <div className="seperator" />
            <div className="title-div">
              <span className="section-title">Wash, Dry, Fold Processing</span>
            </div>
            <span className="section-description">
              Use basic tracking or track machines used for processing the order.
            </span>
            <div className="processing-radio-container">
              <input
                type="radio"
                name="basic-service"
                value="basic"
                checked={selectedLocation?.processingCapability === ProcessingType.basic}
                onChange={(evt) => {
                  updateLocationSettings(
                    location,
                    "processingCapability",
                    ProcessingType.basic
                  );
                }}
              />
              Basic (track processing start and end times)
            </div>
            <div
              className={`processing-radio-container ${
                selectedLocation?.hasMachines ? "" : "disabled"
              }`}
            >
              <input
                type="radio"
                name="advanced"
                value="advanced"
                disabled={!selectedLocation?.hasMachines}
                checked={
                  selectedLocation?.processingCapability === ProcessingType.advanced
                }
                onChange={(evt) => {
                  updateLocationSettings(
                    location,
                    "processingCapability",
                    ProcessingType.advanced
                  );
                }}
              />
              Advanced (track individual washers & dryers)
            </div>
            {!selectedLocation?.hasMachines && (
              <p className="processing-disabled-message">
                * Please set up machines to use advanced processing.
              </p>
            )}
          </div>
        )}
      </div>
      {/* <div className="location-logs row">
        <div>
          <p>
            01/22/19 - TK-WS-0001 closed
            <br />
            01/14/19 - TK-WS-0001 opened
            <br />
            04/19/17 - Machine Added
          </p>
        </div>
      </div> */}
    </>
  );
};

export default LocationDetails;
