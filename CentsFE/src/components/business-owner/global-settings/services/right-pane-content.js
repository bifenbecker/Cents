import React from "react";
import ServiceWizard from "../../../../containers/bo-service-wizard";
import AddNewModifier from "./add-new-modifier";
import {UncontrolledPopover} from "reactstrap";
import TabSwitcher from "../../../commons/tab-switcher/tab-switcher";
import ServiceDetails from "../../../../containers/bo-service-details";
import PricePerLocation from "../../../../containers/bo-services-price-per-location";
import ServiceModifiers from "../../../../containers/bo-service-modifiers";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import PropTypes from "prop-types";
import cx from "classnames";

const FIXED_PRICE_TABS = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "location_pricing",
    label: "Location Pricing",
  },
];

const PER_POUND_TABS = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "location_pricing",
    label: "Location Pricing",
  },
  {
    value: "modifiers",
    label: "Choose Modifiers",
  },
];

const RightPaneContent = ({
  searchInProgress,
  servicesList,
  searchText,
  showNewServiceWizard,
  showAddModifierScreen,
  showHideAddModifierScreen,
  isModifierUpdate,
  createOrUpdateModifier,
  createModifierCallInProgress,
  createModifierError,
  updateModifierValues,
  activeServiceId,
  isPopoverOpen,
  setIsPopoverOpen,
  setShowArchiveModal,
  activeTab,
  handleTabChange,
  setActiveService,
  servicesCategoryList,
  showError,
  toggleModifierError,
  activeServiceDetails,
  flags,
  pricingTypes,
  servicesCategories,
  showNewCategoryScreen,
  categoryForAService,
  newCategoryId,
  updateServices,
  isShowArchived,
}) => {
  // TODO logic to switch between wizards and details goes here
  const {trackEvent} = useTrackEvent();
  if (searchInProgress) {
    const categories = servicesList?.categories || [];
    const list = flags.cents20
      ? servicesList
      : [
          ...(categories[0] ? [...categories[0].services] : []),
          ...(categories[1] ? [...categories[1].services] : []),
        ];
    if (searchText === "" || list.length === 0) {
      return (
        <div className="no-search-results">
          <p>No Search Results</p>
        </div>
      );
    }
  }

  if (showNewServiceWizard) {
    return (
      <ServiceWizard
        pricingTypes={pricingTypes}
        categoryTypes={servicesCategories}
        showCategoryScreen={showNewCategoryScreen}
        categoryForAService={categoryForAService}
        newCategoryId={newCategoryId}
        updateServicesList={updateServices}
        isShowArchived={isShowArchived}
      />
    );
  }

  if (showAddModifierScreen) {
    return (
      <AddNewModifier
        showHideAddModifierScreen={showHideAddModifierScreen}
        isUpdate={isModifierUpdate}
        createOrUpdateModifier={createOrUpdateModifier}
        createModifierCallInProgress={createModifierCallInProgress}
        createModifierError={createModifierError}
        updateModifierValues={updateModifierValues}
      />
    );
  }

  // let serviceName;
  // let serviceCatId;
  // if (servicesList.categories && servicesList.categories.length > 0) {
  //   for (let i = 0; i < servicesList.categories.length; i++) {
  //     let cat = servicesList.categories[i];
  //     for (let j = 0; j < cat.services.length; j++) {
  //       let service = cat.services[j];
  //       if (service.id === activeServiceId) {
  //         serviceName = service.name;
  //         serviceCatId = service.serviceCategoryId;
  //         break;
  //       }
  //     }
  //   }
  // }
  return (
    <>
      {!activeServiceId ? (
        <p className="no-details-message">Please select a service to view details</p>
      ) : (
        <>
          <div className="locations-card-header service-header">
            <p>{activeServiceDetails?.name}</p>
            <div
              className={cx("three-dot-menu service-three-dot-menu", {
                open: isPopoverOpen,
              })}
              id="three-dot-menu-services"
            />
          </div>
          <UncontrolledPopover
            trigger="legacy"
            placement="bottom-end"
            target="three-dot-menu-services"
            isOpen={isPopoverOpen}
            toggle={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            <p
              onClick={() => {
                setShowArchiveModal(true);
                setIsPopoverOpen(false);
                trackEvent(
                  INTERCOM_EVENTS.laundryServices,
                  INTERCOM_EVENTS_TEMPLATES.laundryServices.buttonArchive
                );
              }}
              className="dropdown-options"
            >
              {activeServiceDetails?.isDeleted ? "Unarchive Service" : "Archive Service"}
            </p>
          </UncontrolledPopover>
          <div className="locations-card-content">
            <div className="location-info-container services-tablayout-container">
              <TabSwitcher
                tabs={
                  activeServiceDetails?.pricingStructure?.type === "PER_POUND"
                    ? PER_POUND_TABS
                    : FIXED_PRICE_TABS
                }
                activeTab={activeTab}
                onTabClick={handleTabChange}
                className="location-tabs"
              />
              {activeTab === "details" ? (
                <ServiceDetails
                  activeService={activeServiceDetails}
                  setActiveService={setActiveService}
                  servicesCategoryList={categoryForAService}
                />
              ) : activeTab === "location_pricing" ? (
                <PricePerLocation servicesCategoryList={servicesCategoryList} />
              ) : (
                <ServiceModifiers />
              )}

              <div className="location-info-footer service-detail-footer">
                <div>
                  <p>
                    {activeServiceDetails?.servicePricingStructureId === 1
                      ? "Priced Per Lb Service"
                      : "Fixed Price Service"}
                  </p>
                  {showError && (
                    <p className="error-message">
                      {toggleModifierError?.error?.replace(
                        "some",
                        toggleModifierError.recurringSubscriptionsCount
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

RightPaneContent.propTypes = {
  searchInProgress: PropTypes.bool,
  servicesList: PropTypes.array,
  searchText: PropTypes.string,
  showNewServiceWizard: PropTypes.bool,
  showAddModifierScreen: PropTypes.bool,
  showHideAddModifierScreen: PropTypes.func,
  isModifierUpdate: PropTypes.bool,
  createOrUpdateModifier: PropTypes.func,
  createModifierCallInProgress: PropTypes.bool,
  createModifierError: PropTypes.string,
  updateModifierValues: PropTypes.func,
  activeServiceId: PropTypes.number,
  isPopoverOpen: PropTypes.bool,
  setIsPopoverOpen: PropTypes.func,
  setShowArchiveModal: PropTypes.func,
  activeTab: PropTypes.string,
  handleTabChange: PropTypes.func,
  setActiveService: PropTypes.func,
  servicesCategoryList: PropTypes.array,
  showError: PropTypes.bool,
  toggleModifierError: PropTypes.string,
  activeServiceDetails: PropTypes.object,
  flags: PropTypes.object,
  pricingTypes: PropTypes.array,
  servicesCategories: PropTypes.array,
  showNewCategoryScreen: PropTypes.bool,
  categoryForAService: PropTypes.object,
  newCategoryId: PropTypes.number,
  updateServices: PropTypes.func,
  isShowArchived: PropTypes.bool,
};

export default RightPaneContent;
