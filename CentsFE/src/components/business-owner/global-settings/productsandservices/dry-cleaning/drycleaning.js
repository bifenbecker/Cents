/* eslint-disable react-hooks/exhaustive-deps */
// Package Imports
import React, {useState, useEffect, useCallback} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import InactiveFiltersButton from "../../../../../assets/images/Icon_Filter.svg";
import Checkbox from "../../../../commons/checkbox/checkbox";
import {PopoverBody, UncontrolledPopover} from "reactstrap";
import {useSelector} from "react-redux";
import {sortBy} from "lodash";
import {useFlags} from "launchdarkly-react-client-sdk";
import generatePricing from "../../../../../utils/generatePricing.js";

// Components Import
import Card from "../../../../commons/card/card";
import ServiceDetails from "../../../../../containers/bo-drycleaning-details";
import PricePerLocation from "../../../../../containers/bo-drycleaning-price-per-location";
import ServiceWizard from "../../../../../containers/bo-drycleaning-wizard";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import SearchBar from "../../../../commons/expandable-search-bar/expandable-search-bar";
import TabSwitcher from "../../../../commons/tab-switcher/tab-switcher";
import ArchiveModal from "../../../../commons/archive-modal/archive-modal";
import DropdownMultiSelect from "../../../../commons/multi-select-with-input/multi-select-with-input";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../../../constants";

// Other Imports
import {INTERCOM_EVENTS, INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";
import useTrackEvent from "../../../../../hooks/useTrackEvent";

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
];

const Drycleaning = (props) => {
  const {
    fetchAllServicesList,
    fetchAllNewServicesList,
    fetchPricesStructure,
    fetchCategoriesForServices,
    showHideNewServiceWizard,
    setSearchInProgress,
    setActiveRoundedTab,
    handleServiceSearch,
    drycleaningServicesList,
    drycleaningServicesCategories,
    categoryForAService,
    newdrycleaningServicesList,
    setServicesCategories,
    setServicesSubcategories,
    servicesListError,
    getAllDrycleaningServicesCallInProgress,
    setActiveService,
    activeServiceId,
    searchText,
    servicesList,
    servicesCategoryList,
    searchInProgress,
    activeServiceDetails,
    showNewCategoryScreen,
    activeRoundedTab,
    activeTab,
    handleTabChange,
    getAllServicesCallInProgress,
    showNewCategoryScreenInDetails,
    addNewCategory,
    setArchiveError,
    archiveService,
    newCategoryError,
    handleShowNewCategoryScreenInDetails,
    showHideNewProductWizard,
    handleShowNewProductsPricingScreen,
    handleShowNewCategoryScreen,
    showNewProductsPricingScreen,
    showNewServiceWizard,
    pricingTypes,
    showServicePricesScreen,
    newCategoryId,
    updateServices,
    archiveError,
    servicesRefresh,
    handleNewServiceSearch,
  } = props;
  const {cents20} = useFlags();
  const {trackEvent} = useTrackEvent();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [category, setCategory] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedServices, setShowArchivedServices] = useState(false);

  const globalstate = useSelector(
    (state) => state.businessOwner.globalSettings.doublenav
  );
  let header = globalstate.rightTab.split("-").join(" ");
  header = header.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  const handleSearch = useCallback(
    (searchInput) => {
      handleServiceSearch(searchInput);
    },
    [handleNewServiceSearch]
  );

  useEffect(() => {
    fetchAllServicesList({archived: showArchivedServices || null});
    fetchAllNewServicesList();
    fetchPricesStructure();
    fetchCategoriesForServices(1);
    return () => {
      handleSearch("");
      showHideNewServiceWizard(false);
      setSearchInProgress(false);
      setActiveRoundedTab("per-pound");
    };
  }, [
    fetchAllNewServicesList,
    fetchAllServicesList,
    fetchCategoriesForServices,
    fetchPricesStructure,
    handleSearch,
    setActiveRoundedTab,
    setSearchInProgress,
    showHideNewServiceWizard,
    showArchivedServices,
  ]);

  useEffect(() => {
    fetchAllServicesList({archived: showArchivedServices || null});
    fetchAllNewServicesList();
    fetchPricesStructure();
    fetchCategoriesForServices(1);
  }, [servicesRefresh, showArchivedServices]);

  const handleAddNewCategory = (newCategoryName) => {
    setNewCategory(newCategoryName.trim());
  };

  const getCategories = useCallback(
    (serviceType) => {
      if (newdrycleaningServicesList?.success) {
        const categories = newdrycleaningServicesList?.categories;
        const filteredCategories = categories.filter(
          (category) => category.type === serviceType
        );
        const categoryObjs = filteredCategories[0].serviceCategories;
        setServicesCategories(categoryObjs);
        return categoryObjs;
      }
    },
    [newdrycleaningServicesList, setServicesCategories]
  );
  const options = [
    ...categoryForAService?.map((item) => ({
      label: item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
      value: item.category,
      id: item.id,
      serviceCategoryTypeId: item.serviceCategoryTypeId,
    })),
  ];

  const getServices = useCallback(() => {
    let services = [];
    let service = {};
    drycleaningServicesCategories.forEach((item) => {
      service.category = item.category;
      service.item = item.services;
      services.push(service);
      service = {};
    });
    setServicesSubcategories(services);
    return services;
  }, [drycleaningServicesCategories, setServicesSubcategories]);

  const initializeCategoryState = useCallback(() => {
    if (drycleaningServicesCategories) {
      setCategory(drycleaningServicesCategories.map((label) => label.category));
    }
  }, [drycleaningServicesCategories]);

  useEffect(() => {
    getCategories("DRY_CLEANING");
    getServices();
    initializeCategoryState();
  }, [
    drycleaningServicesList,
    drycleaningServicesCategories,
    categoryForAService,
    getCategories,
    getServices,
    initializeCategoryState,
  ]);

  const renderSubcategoriesList = () => {
    if (servicesListError) {
      return (
        <div className="service-item-list">
          <div key={"error-item"} className={`common-list-item`}>
            <p className="error-message">{servicesListError}</p>
          </div>
        </div>
      );
    }
    if (drycleaningServicesList.length === 0) {
      return null;
    }
    if (
      !drycleaningServicesCategories ||
      (category.length === 0 && !getAllDrycleaningServicesCallInProgress)
    ) {
      return (
        <div className="service-item-list">
          <div key={"No items to show"} className={`common-list-item`}>
            <p>{`No dry cleaning services yet. Click the '+' icon to start adding.`}</p>
          </div>
        </div>
      );
    }
    let data = [...drycleaningServicesList];
    let hasServices = [];
    let noServices = [];
    let services = [];
    data = sortBy(data, (o) => o.category.toLowerCase());
    data.forEach((item) => {
      services = sortBy(item.services, (o) => o.name.toLowerCase());
      item.services = services;
      services = [];
      if (item.services.length === 0) {
        noServices.push(item);
      } else {
        hasServices.push(item);
      }
    });
    hasServices = sortBy(hasServices, (o) => o.category.toLowerCase());
    noServices = sortBy(noServices, (o) => o.category.toLowerCase());
    data = hasServices.concat(noServices);
    return (
      <>
        {data.map((item, idx) => {
          return (
            category.includes(item.category) && (
              <div key={`${item}_${idx}`}>
                <p className="drycleaning-services-container category-title">
                  {item.category === WASH_AND_FOLD_SUBCATEGORY
                    ? "Wash & Fold"
                    : item.category}
                </p>
                <div className="service-item-list">
                  {item.services.map((subcategory) => {
                    if (cents20) {
                      return (
                        <div
                          key={subcategory.id}
                          className={`common-list-item ${
                            activeServiceId === subcategory.id ? "active" : ""
                          }`}
                          onClick={() => {
                            setActiveService(subcategory.id);
                          }}
                        >
                          <Checkbox checked={activeServiceId === subcategory.id} />
                          <p className="text-item">{subcategory.name}</p>
                          {generatePricing(subcategory)}
                          {subcategory.isDeleted && (
                            <span className="archived-tag archived-tag__services">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={subcategory.id}
                          className={`common-list-item ${
                            activeServiceId === subcategory.id ? "active" : ""
                          }`}
                          onClick={() => {
                            setActiveService(subcategory.id);
                          }}
                        >
                          <Checkbox checked={activeServiceId === subcategory.id} />
                          <p className="text-item">{subcategory.name}</p>
                          {subcategory.servicePricingStructureId === 2 ? (
                            <p className="service-item-dollar-amount text-item">
                              {`${
                                subcategory.defaultPrice
                                  ? `$${subcategory.defaultPrice.toFixed(2)}`
                                  : "$0.00"
                              } / unit`}
                            </p>
                          ) : (
                            <p className="service-item-dollar-amount text-item">
                              {`${
                                subcategory.defaultPrice
                                  ? `$${subcategory.defaultPrice.toFixed(2)}`
                                  : "$0.00"
                              } / lb`}
                            </p>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )
          );
        })}
      </>
    );
  };

  const _renderSearchResults = () => {
    if (searchText && props?.drycleaningSearchResults.length !== 0) {
      const searchResults = props.drycleaningSearchResults;
      return (
        <div className="service-item-list search-results">
          {searchResults.map((service) => {
            return (
              <div
                key={service.id}
                className={`common-list-item ${
                  activeServiceId === service.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveService(service.id);
                }}
              >
                <Checkbox checked={activeServiceId === service.id} />
                <p className="service-item-type">{service.name}</p>
                {generatePricing(service)}
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

  const renderLeftPaneContent = () => {
    if (searchInProgress) return _renderSearchResults();
    else return renderSubcategoriesList();
  };

  const renderNewCategoryScreen = () => {
    return (
      <div
        className={`product-wizard-main-container ${
          showNewProductsPricingScreen && "flex-reset"
        }`}
      >
        <div className="product-wizard-exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              handleShowNewCategoryScreenInDetails(false);
            }}
          />
        </div>
        <p className="product-wizard-heading"> Add New Sub-Category</p>
        <div className="product-wizard-form-container">
          <div className="product-wizard-form-input">
            <img src={categoryIcon} alt="" />
            <input
              type="text"
              name="newCategory"
              placeholder="Sub-Category Name"
              onChange={(evt) => handleAddNewCategory(evt.target.value)}
              maxLength="50"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderRightPaneContent = () => {
    // TODO logic to switch between wizards and details goes here
    if (searchInProgress) {
      const categories = props?.servicesList?.categories || [];
      const servicesList = [
        ...(categories[0] ? [...categories[0].services] : []),
        ...(categories[1] ? [...categories[1].services] : []),
      ];
      if (props.searchText === "" || drycleaningServicesList.length === 0) {
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
          showServicePricingScreen={showServicePricesScreen}
          categoryTypes={drycleaningServicesCategories}
          showCategoryScreen={showNewCategoryScreen}
          categoryForAService={categoryForAService}
          newCategoryId={newCategoryId}
          updateServicesList={updateServices}
          showArchivedServices={showArchivedServices}
        />
      );
    }
    return (
      <>
        {!activeServiceId ? (
          <p className="no-details-message">Please select a service to view details</p>
        ) : (
          <>
            <div className="locations-card-header service-header">
              <p>{activeServiceDetails?.name}</p>
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
                {activeServiceDetails?.isDeleted
                  ? "Unarchive Service"
                  : "Archive Service"}
              </p>
            </UncontrolledPopover>
            <div className="locations-card-content">
              {showNewCategoryScreen ? renderNewCategoryScreen() : null}
              <div className="location-info-container services-tablayout-container">
                <TabSwitcher
                  tabs={activeRoundedTab === "per-pound" ? perPoundTabs : fixedPriceTabs}
                  activeTab={activeTab}
                  onTabClick={handleTabChange}
                  className="location-tabs"
                />
                {activeTab === "details" ? (
                  <ServiceDetails
                    activeService={activeServiceDetails}
                    setActiveService={setActiveService}
                    servicesCategoryList={servicesCategoryList}
                    handleShowNewCategoryScreen={handleShowNewCategoryScreen}
                    showNewCategoryScreen={showNewCategoryScreen}
                  />
                ) : activeTab === "location_pricing" ? (
                  <PricePerLocation servicesCategoryList={servicesCategoryList} />
                ) : null}

                <div className="location-info-footer service-detail-footer">
                  <div>
                    <p>
                      {activeServiceDetails?.servicePricingStructureId === 1
                        ? "Priced Per Lb Service"
                        : "Fixed Price Service"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const isServiceDelivered = (activeServiceDetails) => {
    const [...prices] = activeServiceDetails?.prices;

    return prices.some((price) => price.isDeliverable);
  };

  const handleButtonDisable = () => {
    if (!props.showNewCategoryScreenInDetails) {
      return false;
    }

    return !newCategory.trim().length;
  };

  const trackArchivingServiceEvent = (serviceName) => {
    trackEvent(
      INTERCOM_EVENTS.dryCleaning,
      INTERCOM_EVENTS_TEMPLATES.dryCleaning.archiveService,
      {
        "Service Name": serviceName,
      }
    );
  };

  return (
    <Card>
      <div className="bo-global-settings-content-2-column-layout">
        <div className="bo-global-settings-content-left-column">
          <div className="locations-card-container">
            {showArchiveModal ? (
              <ArchiveModal
                from="service"
                isDeleted={activeServiceDetails.isDeleted}
                toggleArchiveModal={(value) => {
                  setShowArchiveModal(value);
                  setArchiveError("");
                }}
                archiveService={() => {
                  if (isServiceDelivered(activeServiceDetails)) {
                    setArchiveError(
                      "Cannot archive this service as it is selected for delivery"
                    );
                  } else {
                    archiveService(activeServiceId, {
                      archived: showArchivedServices || null,
                    });
                    setShowArchiveModal(false);
                    setSearchInProgress(false);
                    handleSearch("");
                    trackArchivingServiceEvent(activeServiceDetails.name);
                  }
                }}
                error={archiveError}
              />
            ) : null}
            <div className="locations-card-header">
              <p>{header}</p>
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
              <DropdownMultiSelect
                label={category.length === 0 ? "All Sub-Categories" : ""}
                itemName={category.length === 1 ? "Sub-Category" : "Sub-Categories"}
                allItemsLabel="All Sub-Categories"
                options={options}
                value={category}
                onChange={setCategory}
                categoryIcon={true}
                className="dropdown.multi-select-with-input dropdown-menu.show dropdown-closed"
              />
              <SearchBar
                className="services-list"
                setSearchInProgress={setSearchInProgress}
                searchInProgress={searchInProgress}
                handleSearch={handleSearch}
                value={searchText}
              />
            </div>
            <div className="locations-card-content">{renderLeftPaneContent()}</div>
            {getAllServicesCallInProgress ? <BlockingLoader /> : null}
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            {showNewCategoryScreenInDetails ? (
              <>
                {renderNewCategoryScreen()}
                <div className="service-prices-footer">
                  <p className="service-footer-error-message">{newCategoryError} </p>
                  <button
                    className="btn btn-text-only cancel-button"
                    onClick={() => {
                      if (showNewCategoryScreenInDetails) {
                        handleShowNewCategoryScreenInDetails(false);
                      } else {
                        showHideNewProductWizard(false);
                        handleShowNewProductsPricingScreen(false);
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-rounded btn-theme"
                    disabled={handleButtonDisable()}
                    onClick={() =>
                      addNewCategory({
                        serviceCategoryTypeId: 1,
                        category: newCategory,
                      })
                    }
                  >
                    {"SAVE"}
                  </button>
                </div>
              </>
            ) : (
              renderRightPaneContent()
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Drycleaning;
