import React, {useEffect} from "react";
import PropTypes from "prop-types";
import useTrackEvent from "../../../../hooks/useTrackEvent";

import Card from "../../../commons/card/card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
// import cautionIcon from '../../../../assets/images/Icon_Caution.svg';
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import Checkbox from "../../../commons/checkbox/checkbox";
import TabSwitcher from "../../../commons/tab-switcher/tab-switcher";
import ServicesAndProducts from "../../../../containers/bo-locations-services-and-products";
import EsdRegistration from "./esd-registration";

import {UncontrolledPopover} from "reactstrap";
import ResetPassword from "../../../../containers/bo-locations-reset-password";
import CheckedInEmployees from "../../../../containers/bo-locations-checked-in-employees";
import AddTaxScreen from "../../../../containers/bo-locations-add-tax-rate";
import AddLocation from "../../../../containers/bo-locations-wizard";
import LocationShifts from "../../../../containers/bo-locations-shifts";
import EditLocation from "./edit-location/edit-location";
import LocationDetails from "./location-details";
import DeliverySettingsSuccess from "./common/delivery-settings-success";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";

// Delivery Settings
// Constants
import {editableDeliveryScreenTypes, deliveryWizardTypes} from "./constants";
import {getLocationTabsList} from "./utils/location";

import {
  DeliverySettings,
  OwnDriverDeliverySettings,
} from "../../../../containers/bo-locations-delivery-settings";

// General Delivery Settings
import OnDemandDeliverySettingsWizard from "./on-demand-delivery-settings/wizard";
import GeneralDeliverySettingsWizard from "./general-delivery-settings/wizard";
import EditDeliveryBuffer from "./own-driver-delivery-settings/edit-delivery-buffer.js";

const EditServicePricingAndAvailability = React.lazy(() =>
  import("./general-delivery-settings/edit-service-pricing-availability")
);
const EditTurnaroundTime = React.lazy(() =>
  import("./general-delivery-settings/edit-turnaround-time")
);
const EditRecurringDiscount = React.lazy(() =>
  import("./general-delivery-settings/edit-recurring-discount")
);
const EditCustomMessage = React.lazy(() =>
  import("./general-delivery-settings/edit-custom-message")
);
const EditServiceArea = React.lazy(() =>
  import("./own-driver-delivery-settings/edit-service-area")
);

const EditPickupAndDeliveryFee = React.lazy(() =>
  import("./own-driver-delivery-settings/edit-pickup-and-delivery-fee")
);

const EditWindows = React.lazy(() =>
  import("./own-driver-delivery-settings/edit-windows")
);

const EditPickUpDropOffHours = React.lazy(() =>
  import("./on-demand-delivery-settings/edit-pick-up-drop-off-hours")
);

const EditDeliverySubsidy = React.lazy(() =>
  import("./on-demand-delivery-settings/edit-delivery-subsidy")
);

const Locations = (props) => {
  const {
    locations,
    onFetchLocations,
    onFetchDistricts,
    onFetchRegions,
    onFetchTaxRates,
    onSetSelectedLocation,
    onResetFullLocationState,
    onShowDetailsScreen,
    onShowServicePricesScreen,
    onShowDeliverySettingsScreen,
    onCloseThreeDotMenuAndScreens,
    onCloseEditDeliverySettingsScreen,
    onSetDeliveryWizard,
    onCloseDeliveryWizard,
    onCloseEditLocationScreen,
    onUpdateLocationInfo,
    onShowCreateLocationScreen,
    onToggleThreeDotMenu,
    onSetShowResetPasswordScreen,
    onSetShowCheckedInEmployees,
    onShowEsdRegistrationScreen,
    onEditLocation,
    onUpdateHubSetting,
    onHandleSaveTaxRate,
    onUpdateIsIntakeOnly,
    onAddNewTaxRate,
    onShowHideShiftsScreen,
    onHandleSelectedLocationInlineSave,
    onUpdateLocationSettings,
    onUpdateIsResidential,
    onCancelEsdRegistration,
    onUpdateEsdSettings,
  } = props;

  const {selectedLocation} = locations;

  const {trackEvent} = useTrackEvent();

  useEffect(() => {
    onFetchLocations(true);
    onFetchDistricts();
    onFetchRegions();
    onFetchTaxRates();

    return () => {
      // Must RESET the entire location state
      onResetFullLocationState();
    };
  }, [
    onFetchDistricts,
    onFetchLocations,
    onFetchRegions,
    onFetchTaxRates,
    onResetFullLocationState,
  ]);

  useEffect(() => {
    locations.refreshLocations && onFetchLocations(false, selectedLocation);
  }, [locations.refreshLocations, onFetchLocations, selectedLocation]);

  useEffect(() => {
    locations.refreshLocationDetails && onSetSelectedLocation(selectedLocation);
  }, [locations.refreshLocationDetails, selectedLocation, onSetSelectedLocation]);

  const handleTabClick = (tabValue) => {
    switch (tabValue) {
      case "details":
        onShowDetailsScreen();
        break;
      case "services&products":
        onShowServicePricesScreen();
        break;
      case "delivery-settings":
        onShowDeliverySettingsScreen();
        break;
      default:
        break;
    }
  };

  const renderLocations = (locationList) => {
    if (!locationList.length) {
      return <div className="common-list-item">No locations to show</div>;
    }

    return locationList.map((location) => {
      const {id, address} = location;

      return (
        <div
          key={id}
          title={address}
          className={`common-list-item ${
            locations.selectedLocation?.id === id && "active"
          }`}
          onClick={() => {
            onSetSelectedLocation(location);
            onCloseThreeDotMenuAndScreens();
          }}
        >
          <Checkbox checked={selectedLocation?.id === id} />
          <p className="rounded-border">{address}</p>
        </div>
      );
    });
  };

  const renderLocationData = () => {
    const location = locations.selectedLocation;

    if (locations.showEsdRegistrationScreen) {
      return (
        <EsdRegistration
          locations={locations}
          showEsdRegistrationScreen={onShowEsdRegistrationScreen}
          cancelEsdRegistration={onCancelEsdRegistration}
          updateEsdSettings={onUpdateEsdSettings}
        />
      );
    }

    if (locations.showResetPasswordScreen) {
      return <ResetPassword />;
    }

    if (locations.showCheckedInEmployees) {
      return <CheckedInEmployees />;
    }

    if (locations.editDeliverySettingsScreenType) {
      switch (locations.editDeliverySettingsScreenType) {
        // General Delivery Settings
        case editableDeliveryScreenTypes.DELIVERY_SERVICES:
          return (
            <EditServicePricingAndAvailability
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              selectedLocation={location}
              deliverySettings={locations.deliverySettings}
              isSaveEnabled
            />
          );
        case editableDeliveryScreenTypes.TURNAROUND_TIME:
          return (
            <EditTurnaroundTime
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              turnAroundInHours={
                locations?.deliverySettings?.generalDeliverySettings?.turnAroundInHours
              }
              storeId={locations?.selectedLocation?.id}
            />
          );
        case editableDeliveryScreenTypes.RECURRING_DISCOUNT:
          return (
            <EditRecurringDiscount
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              recurringDiscountInPercent={
                locations?.deliverySettings?.generalDeliverySettings
                  ?.recurringDiscountInPercent
              }
              storeId={locations?.selectedLocation?.id}
            />
          );
        case editableDeliveryScreenTypes.CUSTOM_MESSAGE:
          return (
            <EditCustomMessage
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              customHeader={
                locations?.deliverySettings?.generalDeliverySettings?.customLiveLinkHeader
              }
              customMessage={
                locations?.deliverySettings?.generalDeliverySettings
                  ?.customLiveLinkMessage
              }
              storeId={locations?.selectedLocation?.id}
            />
          );

        // Own Driver Delivery Settings
        case editableDeliveryScreenTypes.SERVICE_AREA:
          return (
            <EditServiceArea
              storeId={locations?.selectedLocation?.id}
              hasZones={locations?.deliverySettings?.ownDriverDeliverySettings?.hasZones}
              zones={locations?.deliverySettings?.ownDriverDeliverySettings?.zones}
              zipCodeList={
                locations?.deliverySettings?.ownDriverDeliverySettings?.zipCodes
              }
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              deliverySettings={locations.deliverySettings}
              location={locations.selectedLocation}
            />
          );
        case editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_WINDOWS:
          return (
            <EditWindows
              location={locations?.selectedLocation}
              hasZones={locations?.deliverySettings?.ownDriverDeliverySettings?.hasZones}
              zones={locations?.deliverySettings?.ownDriverDeliverySettings?.zones}
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
            />
          );
        case editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_FEE:
          return (
            <EditPickupAndDeliveryFee
              deliveryFee={
                locations?.deliverySettings?.ownDriverDeliverySettings?.deliveryFeeInCents
              }
              returnDeliveryFee={
                locations?.deliverySettings?.ownDriverDeliverySettings
                  ?.returnDeliveryFeeInCents
              }
              storeId={locations?.selectedLocation?.id}
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
            />
          );
        case editableDeliveryScreenTypes.PICKUP_AND_DELIVERY_BUFFER:
          return (
            <EditDeliveryBuffer
              deliveryBufferInHours={
                locations?.deliverySettings?.ownDriverDeliverySettings
                  ?.deliveryWindowBufferInHours
              }
              storeId={locations?.selectedLocation?.id}
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
            />
          );
        case editableDeliveryScreenTypes.PICKUP_AND_DROPOFF_HOURS:
          return (
            <EditPickUpDropOffHours
              //remove if it breaks nothing
              // shifts={locations?.deliverySettings?.onDemandDeliverySettings?.windows}
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
              storeId={locations?.selectedLocation?.id}
            />
          );
        case editableDeliveryScreenTypes.DELIVERY_SUBSIDY:
          return (
            <EditDeliverySubsidy
              subsidyInCents={
                locations?.deliverySettings?.onDemandDeliverySettings?.subsidyInCents
              }
              returnOnlySubsidyInCents={
                locations?.deliverySettings?.onDemandDeliverySettings
                  ?.returnOnlySubsidyInCents
              }
              storeId={locations?.selectedLocation?.id}
              closeEditDeliverySettingsScreen={onCloseEditDeliverySettingsScreen}
            />
          );
        default:
          return null;
      }
    }

    if (locations.deliveryWizard) {
      switch (locations.deliveryWizard) {
        case deliveryWizardTypes.DELIVERY_SETTINGS_ENABLED:
          return <DeliverySettingsSuccess setDeliveryWizard={onSetDeliveryWizard} />;
        case deliveryWizardTypes.GENERAL_DELIVERY_SETTINGS:
          return (
            <GeneralDeliverySettingsWizard
              selectedLocation={locations.selectedLocation}
              deliverySettings={locations.deliverySettings}
              setDeliveryWizard={onSetDeliveryWizard}
              closeDeliveryWizard={onCloseDeliveryWizard}
              location={location}
            />
          );
        case deliveryWizardTypes.OWN_DELIVERY_SETTINGS:
          return (
            <OwnDriverDeliverySettings
              location={locations.selectedLocation}
              deliverySettings={locations.deliverySettings}
              setDeliveryWizard={onSetDeliveryWizard}
              closeDeliveryWizard={onCloseDeliveryWizard}
            />
          );
        case deliveryWizardTypes.ON_DEMAND_DELIVERY_SETTINGS:
          return (
            <OnDemandDeliverySettingsWizard
              location={locations.selectedLocation}
              deliverySettings={locations.deliverySettings}
              setDeliveryWizard={onSetDeliveryWizard}
              closeDeliveryWizard={onCloseDeliveryWizard}
            />
          );
        default:
          return null;
      }
    }

    if (locations.showSaveLocationScreen) {
      return locations.isEdit ? (
        <EditLocation
          selectedLocation={locations.selectedLocation}
          needsRegions={locations.needsRegions}
          districts={locations.districts}
          districtsCallInProgress={locations.districtsCallInProgress}
          errorMessage={locations.errorMessage}
          closeScreen={onCloseEditLocationScreen}
          updateLocationInfo={onUpdateLocationInfo}
          saveLocationCallInProgress={locations.saveLocationCallInProgress}
          location={location}
        />
      ) : (
        <AddLocation />
      );
    }

    if (locations.showAddTaxScreen) {
      return <AddTaxScreen />;
    }

    if (locations.showShiftsScreen) {
      return <LocationShifts />;
    }

    if (!location) {
      if (!locations.list.length) {
        return (
          <div className="locations-card-container d-flex flex-column align-items-center justify-content-center justify-self-center">
            You have not added a location yet
            <button
              className="btn-theme btn-corner-rounded "
              onClick={onShowCreateLocationScreen}
            >
              Add Location
            </button>
          </div>
        );
      } else {
        return (
          <div className="locations-card-container d-flex flex-column align-items-center justify-content-center justify-self-center">
            Please select a location
          </div>
        );
      }
    }

    let activeTab;
    if (locations.showServicePricesScreen) {
      activeTab = "services&products";
    } else if (locations.showDeliverySettingsScreen) {
      activeTab = "delivery-settings";
    } else {
      activeTab = "details";
    }

    return (
      <>
        <div className="locations-card-header">
          <div className="location-header-container">
            <p>{location?.address}</p>
            <div
              className={`location-three-dot-menu ${
                locations.showThreeDotMenuOpen ? "open" : ""
              }`}
              id="three-dot-menu-locations"
            />
            <UncontrolledPopover
              trigger="legacy"
              placement="bottom-end"
              target="three-dot-menu-locations"
              isOpen={locations.showThreeDotMenuOpen}
              toggle={() => onToggleThreeDotMenu(!locations.showThreeDotMenuOpen)}
            >
              <p
                onClick={() => {
                  onSetShowResetPasswordScreen(true);
                  onToggleThreeDotMenu(false);
                  trackEvent(
                    INTERCOM_EVENTS.location3DotMenu,
                    INTERCOM_EVENTS_TEMPLATES.location3DotMenu.locationTabletLogin
                  );
                }}
              >
                Location Tablet Login
              </p>
              <p
                onClick={() => {
                  onShowEsdRegistrationScreen(true);
                  onToggleThreeDotMenu(false);
                  trackEvent(
                    INTERCOM_EVENTS.location3DotMenu,
                    INTERCOM_EVENTS_TEMPLATES.location3DotMenu.configureCashOptions
                  );
                }}
              >
                Configure Cash Options
              </p>
              <p
                onClick={() => {
                  onSetShowCheckedInEmployees(true);
                  onToggleThreeDotMenu(false);
                  trackEvent(
                    INTERCOM_EVENTS.location3DotMenu,
                    INTERCOM_EVENTS_TEMPLATES.location3DotMenu.checkedInEmployees
                  );
                }}
              >
                Checked In Employees
              </p>
            </UncontrolledPopover>
          </div>
        </div>
        <div className="locations-card-content">
          <TabSwitcher
            tabs={getLocationTabsList(locations.selectedLocation)}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            className="location-tabs"
            disabled={false}
          />
          <div className="location-info-container">
            <div className="location-tab-content-container">
              {activeTab === "services&products" ? (
                <ServicesAndProducts /> //<PricePerService />
              ) : activeTab === "delivery-settings" ? (
                <DeliverySettings />
              ) : (
                <LocationDetails
                  locationList={locations.list}
                  needsRegions={locations.needsRegions}
                  taxRatesList={locations.taxRatesList}
                  editLocation={onEditLocation}
                  updateHubSetting={onUpdateHubSetting}
                  selectedLocation={locations.selectedLocation}
                  handleSaveTaxRate={onHandleSaveTaxRate}
                  regionsWithOutHub={locations.regionsWithOutHub}
                  taxUpdateCallInProgress={locations.taxUpdateCallInProgress}
                  // updateBagTracking={this.props.updateBagTracking}
                  updateIsIntakeOnly={onUpdateIsIntakeOnly}
                  locationsWithOutHub={locations.locationsWithOutHub}
                  addNewTaxRate={onAddNewTaxRate}
                  showHideShiftsScreen={onShowHideShiftsScreen}
                  showEsdRegistrationScreen={onShowEsdRegistrationScreen}
                  isWithOutHubCallInProgress={locations.isWithOutHubCallInProgress}
                  handleSelectedLocationInlineSave={onHandleSelectedLocationInlineSave}
                  updateIsResidential={onUpdateIsResidential}
                  updateLocationSettings={onUpdateLocationSettings}
                  processingUpdateCallInProgress={
                    locations.processingUpdateCallInProgress
                  }
                />
              )}
            </div>
          </div>
          <div className="location-info-footer">
            <div>
              <div></div> <p>currently open</p>
              {locations.fullServiceError && (
                <p style={{color: "red"}}>{locations.fullServiceError}</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {locations.showFullPageError ? (
        locations.errorMessage
      ) : (
        <Card>
          <div className={"bo-global-settings-content-2-column-layout"}>
            <div className={"bo-global-settings-content-left-column"}>
              <div className="locations-card-container">
                <div className="locations-card-header">
                  <p>Locations</p>
                  <FontAwesomeIcon
                    icon={faPlus}
                    onClick={() => {
                      onShowCreateLocationScreen();
                      onCloseThreeDotMenuAndScreens();
                      onCloseDeliveryWizard();
                      onCloseEditDeliverySettingsScreen();
                    }}
                  />
                </div>
                <div className="locations-card-content locations-list-spacing">
                  {locations.isLocationCallInProgress && !locations.list.length ? (
                    <BlockingLoader />
                  ) : (
                    renderLocations(locations.list)
                  )}
                </div>
              </div>
            </div>
            <div className={"bo-global-settings-content-right-column"}>
              <div className="locations-card-container info-card-container">
                {locations.isLocationDetailsLoading ||
                (locations.isLocationCallInProgress && !locations.list.length) ? (
                  <BlockingLoader />
                ) : locations.locationDetailsError ? (
                  <p>{locations.locationDetailsError}</p>
                ) : (
                  renderLocationData()
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

Locations.propTypes = {
  locations: PropTypes.object,
  onFetchLocations: PropTypes.func,
  onFetchDistricts: PropTypes.func,
  onFetchRegions: PropTypes.func,
  onFetchTaxRates: PropTypes.func,
  onSetSelectedLocation: PropTypes.func,
  onResetFullLocationState: PropTypes.func,
  onShowDetailsScreen: PropTypes.func,
  onShowServicePricesScreen: PropTypes.func,
  onShowDeliverySettingsScreen: PropTypes.func,
  onCloseThreeDotMenuAndScreens: PropTypes.func,
  onCloseEditDeliverySettingsScreen: PropTypes.func,
  onSetDeliveryWizard: PropTypes.func,
  onCloseDeliveryWizard: PropTypes.func,
  onCloseEditLocationScreen: PropTypes.func,
  onUpdateLocationInfo: PropTypes.func,
  onShowCreateLocationScreen: PropTypes.func,
  onToggleThreeDotMenu: PropTypes.func,
  onSetShowResetPasswordScreen: PropTypes.func,
  onSetShowCheckedInEmployees: PropTypes.func,
  onShowEsdRegistrationScreen: PropTypes.func,
  onEditLocation: PropTypes.func,
  onUpdateHubSetting: PropTypes.func,
  onHandleSaveTaxRate: PropTypes.func,
  onUpdateIsIntakeOnly: PropTypes.func,
  onAddNewTaxRate: PropTypes.func,
  onShowHideShiftsScreen: PropTypes.func,
  onHandleSelectedLocationInlineSave: PropTypes.func,
  onUpdateLocationSettings: PropTypes.func,
  onUpdateIsResidential: PropTypes.func,
  onCancelEsdRegistration: PropTypes.func,
  onUpdateEsdSettings: PropTypes.func,
};

export default Locations;
