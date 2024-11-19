import React, {useState, useEffect, useMemo} from "react";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Progress} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Checkbox from "../../../../commons/checkbox/checkbox";
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import Prices from "./prices";
import NewCategoryScreen from "./new-category-screen";
import ServiceNameScreen from "./service-name-screen";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events.js";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import PropTypes from "prop-types";

const ServiceWizard = ({
  newServicePriceItems,
  categoryForAService,
  handleShowNewCategoryScreen,
  showCategoryScreen,
  addNewCategory,
  updateServicesList,
  handleShowNewServicesPricingScreen,
  showNewServicesPricingScreen,
  addNewService,
  handleChange,
  handleApplyAll,
  handleSelectAll,
  handleMinimumToggle,
  isInServiceEditMode,
  newServicePricingCallProgress,
  showHideNewServiceWizard,
  showNewCategoryScreen,
  addNewServiceCallInProgress,
  newCategoryId,
  addNewServiceError,
  pricingTypes,
  servicesCategoryList,
  categoryTypes,
  isShowArchived,
}) => {
  const {trackEvent} = useTrackEvent();
  const perPoundPricingStructureId = pricingTypes?.data?.pricingStructures?.filter(
    (item) => item.type === "PER_POUND"
  );
  const perPoundCategoryId = servicesCategoryList?.perPoundId;
  const perPoundCategoryTypeId = categoryTypes.filter(
    (item) => item.category === "PER_POUND"
  )[0].serviceCategoryTypeId;
  const [formInputs, setFormInputs] = useState({
    serviceType: "per-pound",
    pricingType: "PER_POUND",
    serviceCategory: "",
    serviceName: "",
    description: "",
    servicePricingStructureId: perPoundPricingStructureId[0].id,
    serviceCategoryId: perPoundCategoryId,
    serviceCategoryTypeId: perPoundCategoryTypeId,
    newCategory: "",
    selectedCategory: null,
  });
  const [category, setCategory] = useState([]);
  const allServicesSelected = useMemo(() => {
    return newServicePriceItems?.prices?.every((price) => price.isFeatured);
  }, [newServicePriceItems]);

  /* Whenever a new category is created, 'categoryForAService' changes. We run this effect to select the newly
	created category by default. */

  useEffect(() => {
    if (formInputs.newCategory) {
      const category = categoryForAService?.find(
        (categoryItem) => categoryItem.category === formInputs.newCategory
      );
      setFormInputs((prevInputs) => ({
        ...prevInputs,
        selectedCategory: {
          label: category?.category,
          value: category?.category,
          id: category?.id,
          serviceCategoryTypeId: category?.serviceCategoryTypeId,
        },
        serviceCategoryId: category?.id,
      }));
    }
  }, [categoryForAService, formInputs.newCategory]);

  const handleFormInput = (evt, validate) => {
    if (evt.target.value === "per-pound") {
      setFormInputs({
        ...formInputs,
        servicePricingStructureId: perPoundPricingStructureId[0].id,
        selectedCategory: {
          label: "Wash & Fold",
          value: "Wash & Fold",
          id: perPoundCategoryId,
          serviceCategoryTypeId: perPoundCategoryTypeId,
        },
      });
    }
    if (evt.target.value === "fixed-price") {
      setFormInputs({
        ...formInputs,
        servicePricingStructureId: 2,
      });
    }
    const newInput = {
      [evt.target.name]: validate
        ? evt.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
        : evt.target.value,
    };
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      ...newInput,
    }));
  };

  const handleCategories = (evt) => {
    if (evt.value === "new-category") {
      handleShowNewCategoryScreen(true);
      return;
    }
    setFormInputs({
      ...formInputs,
      serviceCategory: evt.value,
      serviceCategoryId: evt.id,
      serviceCategoryTypeId: evt.serviceCategoryTypeId,
      selectedCategory: {
        label: evt.label,
        value: evt.label,
        id: evt.id,
        serviceCategoryTypeId: evt.serviceCategoryTypeId,
      },
    });
  };

  const handleSave = () => {
    if (showCategoryScreen) {
      addNewCategory({
        serviceCategoryTypeId: 2,
        category: formInputs.newCategory,
      });
      setFormInputs({
        ...formInputs,
        serviceCategoryId: newCategoryId,
      });
      updateServicesList();
      handleShowNewCategoryScreen(false);
    } else if (!showNewServicesPricingScreen) {
      trackEvent(
        INTERCOM_EVENTS.laundryServices,
        INTERCOM_EVENTS_TEMPLATES.laundryServices.wizardButton,
        {
          "Button Name": "Next",
          "Wizard Step": "One",
        }
      );
      handleShowNewServicesPricingScreen(true);
    } else {
      trackEvent(
        INTERCOM_EVENTS.laundryServices,
        INTERCOM_EVENTS_TEMPLATES.laundryServices.wizardButton,
        {
          "Button Name": "Save",
          "Wizard Step": "Two",
        }
      );
      const data = {
        serviceCategoryId: formInputs.serviceCategoryId,
        name: formInputs.serviceName,
        description: formInputs.description,
        hasMinPrice:
          formInputs.serviceType === "per-pound"
            ? newServicePriceItems.hasMinPrice
            : false,
        prices: newServicePriceItems.prices,
        servicePricingStructureId: formInputs.servicePricingStructureId,
        category: formInputs.serviceCategory,
        serviceCategoryTypeId: formInputs.serviceCategoryTypeId,
      };
      addNewService(data, {archived: isShowArchived});
      updateServicesList();
    }
  };

  const handleCancel = () => {
    if (showNewCategoryScreen) {
      handleShowNewCategoryScreen(false);
    } else {
      if (showNewServicesPricingScreen) {
        trackEvent(
          INTERCOM_EVENTS.laundryServices,
          INTERCOM_EVENTS_TEMPLATES.laundryServices.wizardButton,
          {
            "Button Name": "Cancel",
            "Wizard Step": "Two",
          }
        );
      } else {
        trackEvent(
          INTERCOM_EVENTS.laundryServices,
          INTERCOM_EVENTS_TEMPLATES.laundryServices.wizardButton,
          {
            "Button Name": "Cancel",
            "Wizard Step": "One",
          }
        );
      }
      showHideNewServiceWizard(false);
      handleShowNewServicesPricingScreen(false);
    }
  };

  const handleAddNewCategory = (evt) => {
    setCategory(evt.target.value);
    setFormInputs({
      ...formInputs,
      newCategory: evt.target.value,
    });
  };

  const handleDisable = () => {
    if (!showCategoryScreen) {
      const {serviceName, servicePricingStructureId, selectedCategory} = formInputs;
      return [serviceName, servicePricingStructureId, selectedCategory].includes("");
    } else {
      return !category || !category.length;
    }
  };

  const toggleAllServiceSelection = () => {
    handleSelectAll(!allServicesSelected);
  };
  const showHeaders = () => {
    let showHeader = newServicePriceItems?.prices?.some((price) => price.isFeatured);
    if (formInputs?.serviceType === "per-pound" && newServicePriceItems?.hasMinPrice) {
      showHeader = false;
    }
    return showHeader;
  };

  return (
    <>
      <div className="locations-card-header wizard-header">
        {showNewServicesPricingScreen && (
          <div
            className="back-button-container"
            onClick={() => {
              handleShowNewServicesPricingScreen(false);
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
            <button className="btn btn-text-only cancel-button">{`Back`}</button>
          </div>
        )}
        <p>
          {showNewServicesPricingScreen
            ? "New Laundry Service Pricing"
            : "New Laundry Service"}
        </p>
      </div>
      <Progress value={showNewServicesPricingScreen ? 95 : 50} className="_progressbar" />

      {showNewServicesPricingScreen ? (
        <div className={`service-creation-container service-pricing`}>
          {formInputs.serviceType === "per-pound" && (
            <div className="service-minimum-toggle">
              <p>There is a minimum</p>
              <ToggleSwitch
                className="hub-toggle"
                checked={!!newServicePriceItems?.hasMinPrice}
                onChange={handleMinimumToggle}
              />
            </div>
          )}
          <div className="product-qty-price-header">
            <div className="select-all-container">
              <Checkbox
                checked={allServicesSelected}
                onChange={toggleAllServiceSelection}
              />
              <button
                onClick={toggleAllServiceSelection}
                className="btn btn-text-only cancel-button"
              >
                {allServicesSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            {showHeaders() && (
              <div className="create-service-headers">
                <span className="bold-text service-header-margin">
                  Price{formInputs.serviceType === "per-pound" && " / Lb"}
                </span>
                <span className="bold-text service-header-margin">Taxable</span>
              </div>
            )}
          </div>
          <div className="service-prices-container">
            <Prices
              newServicePriceItems={newServicePriceItems}
              formInputs={formInputs}
              handleChange={handleChange}
              handleApplyAll={handleApplyAll}
            />
          </div>
        </div>
      ) : showCategoryScreen ? (
        <NewCategoryScreen
          handleShowNewCategoryScreen={handleShowNewCategoryScreen}
          handleAddNewCategory={handleAddNewCategory}
        />
      ) : (
        <div className={`service-creation-container`}>
          <div className="service-creation-form">
            <ServiceNameScreen
              isInServiceEditMode={isInServiceEditMode}
              handleFormInput={handleFormInput}
              formInputs={formInputs}
              handleCategories={handleCategories}
              categoryForAService={categoryForAService}
              perPoundPricingStructureId={perPoundPricingStructureId}
            />
          </div>
        </div>
      )}

      <div className="service-prices-footer">
        <p className="service-footer-error-message new-service">{addNewServiceError} </p>
        <button className="btn btn-text-only cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className="btn-theme btn-rounded save-button"
          disabled={handleDisable()}
          onClick={handleSave}
        >
          {showNewServicesPricingScreen ? "SAVE" : "NEXT"}
        </button>
      </div>
      {(addNewServiceCallInProgress || newServicePricingCallProgress) && (
        <BlockingLoader />
      )}
    </>
  );
};

ServiceWizard.propTypes = {
  newServicePriceItems: PropTypes.array,
  categoryForAService: PropTypes.object,
  handleShowNewCategoryScreen: PropTypes.func,
  showCategoryScreen: PropTypes.bool,
  addNewCategory: PropTypes.func,
  updateServicesList: PropTypes.func,
  handleShowNewServicesPricingScreen: PropTypes.func,
  showNewServicesPricingScreen: PropTypes.bool,
  addNewService: PropTypes.func,
  handleChange: PropTypes.func,
  handleApplyAll: PropTypes.func,
  handleSelectAll: PropTypes.func,
  handleMinimumToggle: PropTypes.func,
  isInServiceEditMode: PropTypes.bool,
  newServicePricingCallProgress: PropTypes.number,
  showHideNewServiceWizard: PropTypes.func,
  showNewCategoryScreen: PropTypes.bool,
  addNewServiceCallInProgress: PropTypes.bool,
  newCategoryId: PropTypes.number,
  addNewServiceError: PropTypes.string,
  isShowArchived: PropTypes.bool,
};

export default ServiceWizard;
