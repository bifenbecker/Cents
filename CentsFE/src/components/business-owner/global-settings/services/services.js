// Package Imports
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import React, {useState, useEffect, useCallback} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSelector} from "react-redux";
import PropTypes from "prop-types";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../constants/intercom-events";
import {useFlags} from "launchdarkly-react-client-sdk";
import useTrackEvent from "../../../../hooks/useTrackEvent";
import {PopoverBody, UncontrolledPopover} from "reactstrap";

// Components Import
import Card from "../../../commons/card/card";
import InactiveFiltersButton from "../../../../assets/images/Icon_Filter.svg";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import SearchBar from "../../../commons/expandable-search-bar/expandable-search-bar";
import ArchiveModal from "../../../commons/archive-modal/archive-modal";
import DropdownMultiSelect from "../../../commons/multi-select-with-input/multi-select-with-input";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../../constants";
import LeftPaneContent from "./left-pane-content";
import NewCategoryScreen from "./new-category-screen";
import RightPaneContent from "./right-pane-content";
import Checkbox from "../../../commons/checkbox/checkbox";

const Services = ({
  handleServiceSearch,
  fetchAllServicesList,
  fetchAllNewServicesList,
  fetchPricesStructure,
  fetchCategoriesForServices,
  showHideNewServiceWizard,
  setSearchInProgress,
  setActiveRoundedTab,
  newServicesList,
  setServicesCategories,
  servicesCategories,
  servicesList,
  categoryForAService,
  newCategoryId,
  setServicesSubcategories,
  getAllServicesCallInProgress,
  servicesRefresh,
  handleNewServiceSearch,
  toggleModifierError,
  searchInProgress,
  searchText,
  showNewServiceWizard,
  pricingTypes,
  showNewCategoryScreen,
  updateServices,
  showAddModifierScreen,
  showHideAddModifierScreen,
  isModifierUpdate,
  createOrUpdateModifier,
  createModifierCallInProgress,
  createModifierError,
  updateModifierValues,
  activeServiceId,
  activeServiceDetails,
  activeRoundedTab,
  activeTab,
  handleTabChange,
  setActiveService,
  servicesCategoryList,
  showNewProductsPricingScreen,
  handleShowNewCategoryScreenInDetails,
  showNewCategoryScreenInDetails,
  setArchiveError,
  archiveService,
  archiveError,
  servicesListError,
  newCategoryError,
  showHideNewProductWizard,
  handleShowNewProductsPricingScreen,
  addNewCategory,
  servicesSearchResults,
}) => {
  const flags = useFlags();
  const {trackEvent} = useTrackEvent();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const [category, setCategory] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showFiltersPopover, setShowFiltersPopover] = useState(false);
  const [showArchivedServices, setShowArchivedServices] = useState(false);

  const globalState = useSelector(
    (state) => state.businessOwner.globalSettings.doublenav
  );

  let header = globalState.rightTab.split("-").join(" ");
  header = header.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  const handleSearch = useCallback(
    (searchInput) => {
      flags.cents20
        ? handleNewServiceSearch(searchInput)
        : handleServiceSearch(searchInput);
    },
    [flags.cents20, handleNewServiceSearch, handleServiceSearch]
  );

  useEffect(() => {
    fetchAllServicesList({archived: showArchivedServices || null});
    fetchAllNewServicesList();
    fetchPricesStructure();
    fetchCategoriesForServices(2);
    return () => {
      handleSearch("");
      showHideNewServiceWizard(false);
      setSearchInProgress(false);
      setActiveRoundedTab("per-pound");
    };
  }, [
    fetchAllServicesList,
    fetchAllNewServicesList,
    fetchPricesStructure,
    fetchCategoriesForServices,
    handleSearch,
    showHideNewServiceWizard,
    setSearchInProgress,
    setActiveRoundedTab,
    showArchivedServices,
  ]);

  useEffect(() => {
    if (toggleModifierError.error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  }, [toggleModifierError]);

  useEffect(() => {
    fetchAllServicesList({archived: showArchivedServices || null});
    fetchAllNewServicesList();
    fetchPricesStructure();
    fetchCategoriesForServices(2);
  }, [
    fetchAllNewServicesList,
    fetchAllServicesList,
    fetchCategoriesForServices,
    fetchPricesStructure,
    servicesRefresh,
    showArchivedServices,
  ]);

  const getCategories = useCallback(
    (serviceType) => {
      if (newServicesList.success) {
        const categories = newServicesList.categories;
        const filteredCategories = categories.filter(
          (category) => category.type === serviceType
        );

        if (!filteredCategories.length) {
          return [];
        }

        const categoryObjs = filteredCategories[0].serviceCategories;
        setServicesCategories(categoryObjs);
        return categoryObjs;
      }
    },
    [newServicesList.categories, newServicesList.success, setServicesCategories]
  );

  const getServices = useCallback(() => {
    let services = [];
    let service = {};
    servicesCategories.forEach((item) => {
      service.category = item.category;
      service.item = item.services;
      services.push(service);
      service = {};
    });
    setServicesSubcategories(services);
    return services;
  }, [servicesCategories, setServicesSubcategories]);

  const initializeCategoryState = useCallback(() => {
    if (servicesList) {
      setCategory(
        servicesList.map((label) =>
          label.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : label.category
        )
      );
    }
  }, [servicesList]);

  const renderOptions = useCallback(() => {
    const oldOptions = [
      ...categoryForAService?.map((item) => ({
        label:
          item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
        value:
          item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
        id: item.id,
        serviceCategoryTypeId: item.serviceCategoryTypeId,
      })),
    ];
    const washAndFold = oldOptions.filter((item) => {
      return item.label === "Wash & Fold";
    });

    const noWashAndFoldOptions = oldOptions.filter((item) => {
      return item.label !== "Wash & Fold";
    });

    return washAndFold.concat(noWashAndFoldOptions);
  }, [categoryForAService]);

  useEffect(() => {
    getCategories("LAUNDRY");
    getServices();
    initializeCategoryState();
    renderOptions();
  }, [
    newServicesList,
    servicesCategories,
    servicesList,
    categoryForAService,
    newCategoryId,
    getCategories,
    getServices,
    initializeCategoryState,
    renderOptions,
  ]);

  const handleAddNewCategory = (newCategoryName) => {
    setNewCategory(newCategoryName.trim());
  };

  const generatePricing = (subcategory) => {
    const uniquePricesArr = [];
    const isFeaturedArr = subcategory.prices.filter(
      (obj) => obj.isFeatured && obj.storeId
    );

    if (isFeaturedArr.length > 1) {
      isFeaturedArr.forEach((obj) =>
        !uniquePricesArr.includes(obj.storePrice)
          ? uniquePricesArr.push(obj.storePrice)
          : null
      );
    }
    const priceScheme =
      subcategory?.pricingStructure?.type === "FIXED_PRICE" ? "/ unit" : "/ lb";

    return (
      <p className="service-item-dollar-amount text-item">
        {!isFeaturedArr.length
          ? `$0.00 ${priceScheme}`
          : uniquePricesArr.length === 1
          ? `$${uniquePricesArr[0].toFixed(2)} ${priceScheme}`
          : `${uniquePricesArr.length} prices`}
      </p>
    );
  };

  const isServiceDelivered = (activeServiceDetails) => {
    let [...prices] = activeServiceDetails?.prices;
    return prices.some((price) => price.isDeliverable);
  };

  const handleButtonDisable = () => {
    if (!showNewCategoryScreenInDetails) return false;
    else return !newCategory.trim().length;
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
                  trackEvent(
                    INTERCOM_EVENTS.laundryServices,
                    INTERCOM_EVENTS_TEMPLATES.laundryServices.buttonAdd
                  );
                }}
                className="products-plus-button"
              />
            </div>

            <div className="services-tab-search-container">
              <DropdownMultiSelect
                label={category.length === 0 ? "All Sub-Categories" : ""}
                itemName={category.length === 1 ? "Sub-Category" : "Sub-Categories"}
                allItemsLabel="All Sub-Categories"
                options={renderOptions()}
                value={category || ""}
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
            <div className="locations-card-content">
              <LeftPaneContent
                searchInProgress={searchInProgress}
                searchText={searchText}
                servicesList={servicesList}
                servicesCategoryList={servicesCategoryList}
                activeServiceId={activeServiceId}
                setActiveService={setActiveService}
                servicesListError={servicesListError}
                getAllServicesCallInProgress={getAllServicesCallInProgress}
                servicesCategories={servicesCategories}
                category={category}
                flags={flags}
                generatePricing={generatePricing}
                servicesSearchResults={servicesSearchResults}
              />
            </div>
            {getAllServicesCallInProgress && <BlockingLoader />}
          </div>
        </div>
        <div className={"bo-global-settings-content-right-column"}>
          <div className="locations-card-container info-card-container">
            {showNewCategoryScreenInDetails ? (
              <>
                <NewCategoryScreen
                  showNewProductsPricingScreen={showNewProductsPricingScreen}
                  handleShowNewCategoryScreenInDetails={
                    handleShowNewCategoryScreenInDetails
                  }
                  handleAddNewCategory={handleAddNewCategory}
                  newCategory={newCategory}
                />
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
                        serviceCategoryTypeId: 2,
                        category: newCategory,
                      })
                    }
                  >
                    {"SAVE"}
                  </button>
                </div>
              </>
            ) : (
              <RightPaneContent
                searchInProgress={searchInProgress}
                servicesList={servicesList}
                searchText={searchText}
                showNewServiceWizard={showNewServiceWizard}
                showAddModifierScreen={showAddModifierScreen}
                showHideAddModifierScreen={showHideAddModifierScreen}
                isModifierUpdate={isModifierUpdate}
                createOrUpdateModifier={createOrUpdateModifier}
                createModifierCallInProgress={createModifierCallInProgress}
                createModifierError={createModifierError}
                updateModifierValues={updateModifierValues}
                activeServiceId={activeServiceId}
                isPopoverOpen={isPopoverOpen}
                setIsPopoverOpen={setIsPopoverOpen}
                setShowArchiveModal={setShowArchiveModal}
                activeRoundedTab={activeRoundedTab}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                setActiveService={setActiveService}
                servicesCategoryList={servicesCategoryList}
                showError={showError}
                toggleModifierError={toggleModifierError}
                activeServiceDetails={activeServiceDetails}
                flags={flags}
                pricingTypes={pricingTypes}
                servicesCategories={servicesCategories}
                showNewCategoryScreen={showNewCategoryScreen}
                categoryForAService={categoryForAService}
                newCategoryId={newCategoryId}
                updateServices={updateServices}
                isShowArchived={showArchivedServices}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

Services.propTypes = {
  handleServiceSearch: PropTypes.func,
  fetchAllServicesList: PropTypes.func,
  fetchAllNewServicesList: PropTypes.func,
  fetchPricesStructure: PropTypes.func,
  fetchCategoriesForServices: PropTypes.func,
  showHideNewServiceWizard: PropTypes.func,
  setSearchInProgress: PropTypes.func,
  setActiveRoundedTab: PropTypes.func,
  newServicesList: PropTypes.array,
  setServicesCategories: PropTypes.func,
  servicesCategories: PropTypes.object,
  servicesList: PropTypes.array,
  categoryForAService: PropTypes.object,
  newCategoryId: PropTypes.number,
  setServicesSubcategories: PropTypes.func,
  getAllServicesCallInProgress: PropTypes.func,
  servicesRefresh: PropTypes.func,
  handleNewServiceSearch: PropTypes.func,
  toggleModifierError: PropTypes.func,
  searchInProgress: PropTypes.bool,
  searchText: PropTypes.string,
  showNewServiceWizard: PropTypes.bool,
  pricingTypes: PropTypes.array,
  showNewCategoryScreen: PropTypes.bool,
  updateServices: PropTypes.func,
  showAddModifierScreen: PropTypes.bool,
  showHideAddModifierScreen: PropTypes.bool,
  isModifierUpdate: PropTypes.bool,
  createOrUpdateModifier: PropTypes.func,
  createModifierCallInProgress: PropTypes.bool,
  createModifierError: PropTypes.string,
  updateModifierValues: PropTypes.func,
  activeServiceId: PropTypes.number,
  activeServiceDetails: PropTypes.object,
  activeRoundedTab: PropTypes.string,
  activeTab: PropTypes.string,
  handleTabChange: PropTypes.func,
  setActiveService: PropTypes.func,
  servicesCategoryList: PropTypes.array,
  showNewProductsPricingScreen: PropTypes.bool,
  handleShowNewCategoryScreenInDetails: PropTypes.func,
  showNewCategoryScreenInDetails: PropTypes.bool,
  setArchiveError: PropTypes.func,
  archiveService: PropTypes.func,
  archiveError: PropTypes.string,
  servicesListError: PropTypes.string,
  newCategoryError: PropTypes.string,
  showHideNewProductWizard: PropTypes.func,
  handleShowNewProductsPricingScreen: PropTypes.func,
  addNewCategory: PropTypes.func,
  servicesSearchResults: PropTypes.object,
};

export default Services;
