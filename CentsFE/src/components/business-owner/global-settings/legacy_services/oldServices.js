import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../../commons/checkbox/checkbox";
import {PopoverBody, UncontrolledPopover} from "reactstrap";

// Components Import
import Card from "../../../commons/card/card";
import ServiceDetails from "../../../../containers/bo-service-details-legacy";
import PricePerLocation from "../../../../containers/bo-services-price-per-location-legacy";
import ServiceWizard from "../../../../containers/bo-service-wizard-legacy";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import RoundedTabSwitcher from "../../../commons/rounder-tab-switcher/rounded-tab-switcher";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import TabSwitcher from "../../../commons/tab-switcher/tab-switcher";
import ServiceModifiers from "../../../../containers/bo-service-modifiers-legacy";
import AddNewModifier from "./add-new-modifier";
import ArchiveModal from "../../../commons/archive-modal/archive-modal";
import InactiveFiltersButton from "../../../../assets/images/Icon_Filter.svg";

const serviceTypes = {
  perPound: "PER_POUND",
  fixedPrice: "FIXED_PRICE",
};

const fixedPriceTabs = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "location_pricing",
    label: "Location Pricing",
  },
];

const perPoundTabs = [
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

const OldServices = (props) => {
  const {
    handleServiceSearch,
    fetchAllServicesList,
    showHideNewServiceWizard,
    setSearchInProgress,
    setActiveRoundedTab,
    getAllServicesCallInProgress,
    setActiveService,
    setArchiveError,
    archiveService,
  } = props;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedServices, setShowArchivedServices] = useState(false);

  const handleSearch = (searchInput) => {
    handleServiceSearch(searchInput);
  };

  useEffect(() => {
    return () => {
      showHideNewServiceWizard(false);
      setActiveRoundedTab("per-pound");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.toggleModifierError.error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  }, [props.toggleModifierError]);

  useEffect(() => {
    fetchAllServicesList({archived: showArchivedServices || null});
    return () => {
      handleSearch("");
      setSearchInProgress(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchivedServices]);

  const getServices = (serviceType) => {
    const data = props?.servicesList?.find((ele) => {
      return ele?.category === serviceType;
    });
    return data?.services;
  };

  const findServiceById = (serviceId) => {
    if (props.servicesList && props.servicesList.length > 0) {
      for (let cat of props.servicesList) {
        for (let service of cat.services) {
          if (service.id === serviceId) {
            return service;
          }
        }
      }
    }
  };

  const renderItems = (type) => {
    if (props.servicesListError) {
      return (
        <div className="service-item-list">
          <div key={"error-item"} className={`common-list-item`}>
            <p className="error-message">{props.servicesListError}</p>
          </div>
        </div>
      );
    }

    if (props?.servicesList.length === 0) {
      return null;
    }
    let servicesList = getServices(type);

    if (!servicesList || (servicesList.length === 0 && !getAllServicesCallInProgress)) {
      return (
        <div className="service-item-list">
          <div key={"No items to show"} className={`common-list-item`}>
            <p>{`No ${
              type === serviceTypes.perPound ? "Per-Pound" : "Fixed-Price "
            } items yet. Click the '+' icon to start adding.`}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="service-item-list">
        {servicesList.map((service) => {
          return (
            <div
              key={service.id}
              className={`common-list-item ${
                props.activeServiceId === service.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveService(service.id);
              }}
            >
              <Checkbox checked={props.activeServiceId === service.id} />
              <p className="service-item-type">{service.name}</p>
              <p className="service-item-dollar-amount">
                {service.defaultPrice.length === 1
                  ? `${
                      service.defaultPrice[0]
                        ? `$${service.defaultPrice[0].toFixed(2)}`
                        : "$0.00"
                    } / ${type === serviceTypes.perPound ? "lb" : "unit"}`
                  : `${service.defaultPrice.length} prices`}
              </p>
              {service.isDeleted && (
                <span className="archived-tag archived-tag__services">ARCHIVED</span>
              )}
            </div>
          );
        })}
        <div
          key={"new-service-list-button"}
          className={`common-list-item ${
            props.showNewServiceWizard && !props.isInServiceEditMode ? "active" : ""
          } plus-item`}
          onClick={() => {
            handleSearch("");
            showHideNewServiceWizard(true);
          }}
        >
          <p>+</p>
        </div>
      </div>
    );
  };

  const _renderSearchResults = () => {
    if (props.searchText && props.servicesSearchResults.length) {
      return (
        <div className="service-item-list search-results">
          {props.servicesSearchResults.map((service) => {
            let priceUnit =
              props.servicesCategoryList.perPoundId === service.serviceCategoryId
                ? "lb"
                : "unit";
            return (
              <div
                key={service.id}
                className={`common-list-item ${
                  props.activeServiceId === service.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveService(service.id);
                }}
              >
                <Checkbox checked={props.activeServiceId === service.id} />
                <p className="service-item-type">{service.name}</p>
                <p className="service-item-dollar-amount">
                  {service.defaultPrice.length === 1
                    ? service.defaultPrice[0]
                      ? `$${service.defaultPrice[0].toFixed(2)} / ${priceUnit}`
                      : `$0.00 / ${priceUnit}`
                    : `${service.defaultPrice.length} prices`}
                </p>
                {service.isDeleted && (
                  <span className="archived-tag archived-tag__services">ARCHIVED</span>
                )}
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="service-item-list search-results">
          <div key={"No search results"} className={`common-list-item`}>
            <p style={{fontStyle: "italic"}}>{`No Search Results.`}</p>
          </div>
        </div>
      );
    }
  };

  const renderRightPaneContent = () => {
    // TODO logic to switch between wizards and details goes here

    if (props.searchInProgress) {
      if (props.searchText === "" || !props?.servicesSearchResults?.length) {
        return (
          <div className="no-search-results">
            <p>No Search Results</p>
          </div>
        );
      }
    }

    if (props.showNewServiceWizard) {
      return <ServiceWizard showArchivedServices={showArchivedServices} />;
    }

    if (props.showAddModifierScreen) {
      return (
        <AddNewModifier
          showHideAddModifierScreen={props.showHideAddModifierScreen}
          isUpdate={props.isModifierUpdate}
          createOrUpdateModifier={props.createOrUpdateModifier}
          createModifierCallInProgress={props.createModifierCallInProgress}
          createModifierError={props.createModifierError}
          updateModifierValues={props.updateModifierValues}
        />
      );
    }

    const service = findServiceById(props.activeServiceId);

    return (
      <>
        {!props.activeServiceId ? (
          <p className="no-details-message">Please select a service to view details</p>
        ) : (
          <>
            <div className="locations-card-header service-header">
              <p>{service.name}</p>
              <div
                className={`three-dot-menu ${
                  isPopoverOpen ? "open" : ""
                } service-three-dot-menu`}
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
                }}
                className="dropdown-options"
              >
                {service.isDeleted ? "Unarchive Service" : "Archive Service"}
              </p>
            </UncontrolledPopover>
            <div className="locations-card-content">
              <div className="location-info-container services-tablayout-container">
                <TabSwitcher
                  tabs={
                    props.activeRoundedTab === "per-pound" ? perPoundTabs : fixedPriceTabs
                  }
                  activeTab={props.activeTab}
                  onTabClick={props.handleTabChange}
                  className="location-tabs"
                />
                {props.activeTab === "details" ? (
                  <ServiceDetails
                    setActiveService={props.setActiveService}
                    servicesCategoryList={props.servicesCategoryList}
                  />
                ) : props.activeTab === "location_pricing" ? (
                  <PricePerLocation servicesCategoryList={props.servicesCategoryList} />
                ) : (
                  <ServiceModifiers />
                )}

                <div className="location-info-footer service-detail-footer">
                  <div>
                    <p>
                      {service.serviceCategoryId === props.servicesCategoryList.perPoundId
                        ? "Priced Per Lb Service"
                        : "Fixed Price Service"}
                    </p>
                    {showError ? (
                      <p className="error-message">
                        {props.toggleModifierError?.error?.replace(
                          "some",
                          props.toggleModifierError.recurringSubscriptionsCount
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const renderLeftPaneContent = () => {
    if (props.searchInProgress) return _renderSearchResults();
    else if (props.activeRoundedTab === "per-pound")
      return renderItems(serviceTypes.perPound);
    else return renderItems(serviceTypes.fixedPrice);
  };

  const isServiceDelivered = (activeServiceDetails) => {
    let [...prices] = activeServiceDetails?.prices;
    return prices.some((price) => price.isDeliverable);
  };
  return (
    <Card>
      <div className={"bo-global-settings-content-2-column-layout"}>
        <div className={"bo-global-settings-content-left-column"}>
          <div className="locations-card-container">
            {showArchiveModal ? (
              <ArchiveModal
                from="service"
                isDeleted={findServiceById(props.activeServiceId).isDeleted}
                toggleArchiveModal={(value) => {
                  setShowArchiveModal(value);
                  setArchiveError("");
                }}
                archiveService={() => {
                  if (isServiceDelivered(props.activeServiceDetails)) {
                    setArchiveError(
                      "Cannot archive this service as it is selected for delivery"
                    );
                  } else {
                    archiveService(props.activeServiceId, {
                      archived: showArchivedServices || null,
                    });
                    handleSearch("");
                    setSearchInProgress(false);
                    setShowArchiveModal(false);
                  }
                }}
                error={props.archiveError}
              />
            ) : null}
            <div className="locations-card-header">
              <p>Services</p>
              <div className="filter-button">
                <img
                  id="archive-filters-icon"
                  alt="archive"
                  src={InactiveFiltersButton}
                />
                <UncontrolledPopover
                  trigger="legacy"
                  placement="bottom-end"
                  target="archive-filters-icon"
                  isOpen={showFiltersPopover}
                  toggle={() => setShowFiltersPopover(!showFiltersPopover)}
                >
                  <PopoverBody>FILTERS</PopoverBody>
                  <PopoverBody>
                    <span>Show archived</span>
                    <Checkbox
                      checked={showArchivedServices}
                      onChange={() => {
                        if (showFiltersPopover) {
                          setShowFiltersPopover(!showFiltersPopover);
                          setShowArchivedServices(!showArchivedServices);
                        }
                      }}
                    />
                  </PopoverBody>
                </UncontrolledPopover>
              </div>
              <FontAwesomeIcon
                icon={faPlus}
                onClick={() => {
                  handleSearch("");
                  setSearchInProgress(false);
                  showHideNewServiceWizard(true);
                }}
                className="products-plus-button"
              />
            </div>
            <div className="services-tab-search-container">
              {!props.searchInProgress && (
                <RoundedTabSwitcher
                  className="service-categories"
                  roundedTabs={props.roundedTabs}
                  activeRoundedTab={props.activeRoundedTab}
                  setActiveRoundedTab={props.setActiveRoundedTab}
                />
              )}
              <SearchBar
                className="services-list"
                setSearchInProgress={props.setSearchInProgress}
                searchInProgress={props.searchInProgress}
                handleSearch={handleSearch}
                value={props.searchText}
              />
            </div>
            <div className="locations-card-content">{renderLeftPaneContent()}</div>
            {props.getAllServicesCallInProgress ? <BlockingLoader /> : null}
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            {renderRightPaneContent()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OldServices;
