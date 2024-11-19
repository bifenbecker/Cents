import React, {useState, useEffect, Fragment, useMemo} from "react";
import {sortBy} from "lodash";

import role_side_panel from "../../../../../assets/images/Icon_Role_Side_Panel.svg";
import notesIcon from "../../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import TextField from "../../../../commons/textField/textField";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Progress} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PriceListItem from "../../../global-settings/price-list-item";
import Checkbox from "../../../../commons/checkbox/checkbox";
import ToggleSwitch from "../../../../commons/toggle-switch/toggleSwitch";
import MaterialSelect from "../../../../commons/select/select";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import drycleaningIcon from "../../../../../assets/images/Icon_Dry_Cleaning.svg";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../../../constants";
import {INTERCOM_EVENTS, INTERCOM_EVENTS_TEMPLATES} from "constants/intercom-events";
import useTrackEvent from "../../../../../hooks/useTrackEvent";

const ServiceWizard = (props) => {
  const {
    newServicePriceItems,
    categoryForAService,
    handleShowNewCategoryScreen,
    showCategoryScreen,
    addNewCategory,
    updateServicesList,
    addNewService,
    handleChange,
    handleApplyAll,
    showNewServicesPricingScreen,
    handleShowNewServicesPricingScreen,
    handleSelectAll,
    handleMinimumToggle,
    isInServiceEditMode,
    addNewServiceError,
    showNewCategoryScreen,
    showHideNewServiceWizard,
    addNewServiceCallInProgress,
    newServicePricingCallProgress,
    showArchivedServices,
  } = props;
  const [formInputs, setFormInputs] = useState({
    serviceType: "",
    pricingType: "FIXED_PRICE",
    serviceCategory: "",
    serviceName: "",
    description: "",
    servicePricingStructureId: 2,
    serviceCategoryId: "",
    serviceCategoryTypeId: "",
    newCategory: "",
    selectedCategory: null,
    pieces: 1,
  });
  const [category, setCategory] = useState([]);
  const allServicesSelected = useMemo(() => {
    return newServicePriceItems?.prices?.every((price) => price.isFeatured);
  }, [newServicePriceItems]);
  const {trackEvent} = useTrackEvent();

  /* Whenever a new category is created, 'props.categoryForAService' changes. We run this effect to select the newly
	created category by default. */

  useEffect(() => {
    if (formInputs.newCategory) {
      const category = categoryForAService.find(
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
    if (evt.target.value === "PER_POUND") {
      setFormInputs({
        ...formInputs,
        servicePricingStructureId: 1,
      });
    }
    if (evt.target.value === "FIXED_PRICE") {
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

  const renderOptions = () => {
    let categories = categoryForAService;
    categories = sortBy(categories, (o) => o.category.toLowerCase());
    const options = [
      {
        value: "new-category",
        label: "+ Add New Sub-Category",
        id: "",
        serviceCategoryTypeId: "",
      },
      ...categories.map((item) => ({
        label:
          item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
        value: item.category,
        id: item.id,
        serviceCategoryTypeId: item.serviceCategoryTypeId,
      })),
    ];
    return options;
  };

  const trackAddingNewServiceEvent = (serviceName) => {
    trackEvent(
      INTERCOM_EVENTS.dryCleaning,
      INTERCOM_EVENTS_TEMPLATES.dryCleaning.addNewService,
      {
        "Service Name": serviceName,
      }
    );
  };

  const handleSave = () => {
    if (showCategoryScreen) {
      addNewCategory({
        serviceCategoryTypeId: 1,
        category: formInputs.newCategory,
      });
      setFormInputs({
        ...formInputs,
        serviceCategoryId: props.newCategoryId,
      });
      updateServicesList();
      handleShowNewCategoryScreen(false);
    } else if (!showNewServicesPricingScreen) {
      handleShowNewServicesPricingScreen(true);
    } else {
      const data = {
        serviceCategoryId: formInputs.serviceCategoryId,
        name: formInputs.serviceName,
        description: formInputs.description,
        hasMinPrice:
          formInputs.pricingType === "PER_POUND"
            ? props.newServicePriceItems.hasMinPrice
            : false,
        prices: props.newServicePriceItems.prices,
        servicePricingStructureId: formInputs.servicePricingStructureId,
        category: formInputs.serviceCategory,
        serviceCategoryTypeId: formInputs.serviceCategoryTypeId,
        piecesCount: formInputs.pieces,
      };
      addNewService(data, {archived: showArchivedServices}).then((error) => {
        if (!error) {
          trackAddingNewServiceEvent(data.name);
        }
      });
      updateServicesList();
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
      const disableNextButton = [
        serviceName,
        servicePricingStructureId,
        selectedCategory,
      ].includes("");
      return disableNextButton;
    } else {
      // const {newCategory} = formInputs;
      return category && category.length > 0 ? false : true;
    }
  };

  const renderPrices = () => {
    if (!props.newServicePriceItems) {
      return null;
    }

    return props.newServicePriceItems.prices.map((price, index) => {
      let serviceItem = {
        minQty: price.minQty,
        price: price.storePrice,
        title: price.store?.name,
        minPrice: price.minPrice,
        isTaxable: price?.isTaxable,
        isSelected: price.isFeatured,
        hasMinPrice:
          formInputs.pricingType === "PER_POUND"
            ? newServicePriceItems.hasMinPrice
            : false,
        priceUnit: formInputs.pricingType === "PER_POUND" ? "lb" : "unit",
      };

      return (
        <PriceListItem
          type="SERVICE"
          key={`service-location-${price.id}`}
          item={serviceItem}
          showApplyToAll={
            index === newServicePriceItems?.prices?.findIndex((price) => price.isFeatured)
          }
          unselectedMessage="Not featured in this location"
          onChange={(field, value) => {
            const formField = field === "isSelected" ? "isFeatured" : field;
            const formValue =
              typeof value === "boolean"
                ? value
                : value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
            const storeId = price.storeId;
            handleChange(formValue, storeId, formField);
          }}
          onApplyAll={() => handleApplyAll(index)}
        />
      );
    });
  };

  const renderNewCategoryScreen = () => {
    return (
      <div className={`product-wizard-main-container`}>
        <div className="product-wizard-exit-icon-container">
          <img
            src={exitIcon}
            alt=""
            onClick={() => {
              handleShowNewCategoryScreen(false);
            }}
          />
        </div>
        <p className="product-wizard-heading">Add New Sub-Category</p>
        <div className="product-wizard-form-container">
          <div className="product-wizard-form-input">
            <img src={categoryIcon} alt="" />
            <input
              type="text"
              name="newCategory"
              placeholder="Sub-Category Name"
              onChange={(evt) => handleAddNewCategory(evt)}
              maxLength="50"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderServiceNameScreen = () => (
    <Fragment>
      <div className={`product-wizard-main-container`}>
        <div className="service-input-containers">
          <div className="input-container">
            <img src={role_side_panel} className="icon" alt="" />
            <TextField
              label="Service Name"
              className="service-name-input"
              name="serviceName"
              onChange={(evt) => {
                handleFormInput(evt);
              }}
              value={formInputs.serviceName}
            />
          </div>
          <div className="input-container categories-dropdown">
            <img src={categoryIcon} style={{marginRight: "8px"}} alt="" />
            <MaterialSelect
              className="service-name-input service-subcategory"
              placeholder="Sub-Category"
              label="Sub-Category"
              options={renderOptions()}
              smallHeight
              onChange={(evt) => {
                handleCategories(evt);
              }}
              value={formInputs?.selectedCategory}
              maxMenuHeight={180}
              menuShouldScrollIntoView={true}
            />
          </div>
          <div className="input-container">
            <img src={notesIcon} className="icon" style={{marginBottom: "60px"}} alt="" />
            <textarea
              name="description"
              className="service-name-input"
              placeholder="Description"
              onChange={(evt) => {
                handleFormInput(evt);
              }}
              value={formInputs.description}
            />
          </div>
          <div className="input-container">
            <img src={drycleaningIcon} className="icon" alt="" />
            <TextField
              className="service-name-input"
              suffix={formInputs.pieces === 1 ? "Piece" : "Pieces"}
              name="pieces"
              onChange={(evt) => {
                handleFormInput(evt);
              }}
              value={formInputs.pieces}
            />
          </div>
          <div className="input-container">
            <p className="dropdown-helper-text">
              {" "}
              Note: a garment tag will print for each piece
            </p>
          </div>
        </div>
      </div>
    </Fragment>
  );
  const toggleAllServiceSelection = () => {
    handleSelectAll(!allServicesSelected);
  };
  const showHeaders = () => {
    let showHeader = props.newServicePriceItems?.prices?.some(
      (price) => price.isFeatured
    );
    if (formInputs?.serviceType === "per-pound" && newServicePriceItems?.hasMinPrice) {
      showHeader = false;
    }
    return showHeader;
  };
  return (
    <Fragment>
      <div className="locations-card-header wizard-header">
        {props.showNewServicesPricingScreen && (
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
            ? "New Dry Cleaning Service Pricing"
            : "New Dry Cleaning Service"}
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
          {!isInServiceEditMode && formInputs.serviceCategory === "PER_POUND" ? (
            <div className="type-of-service-selection">
              <div className="service-radio-button">
                <input
                  type="radio"
                  value="PER_POUND"
                  name="pricingType"
                  onChange={(evt) => {
                    handleFormInput(evt);
                  }}
                  checked={formInputs.pricingType === "PER_POUND"}
                />
                <p>Priced Per Lb</p>
              </div>
              <div className="service-radio-button">
                <input
                  type="radio"
                  value="FIXED_PRICE"
                  name="pricingType"
                  onChange={(evt) => {
                    handleFormInput(evt);
                  }}
                  checked={formInputs.pricingType === "FIXED_PRICE"}
                />
                <p>Fixed Price</p>
              </div>
            </div>
          ) : null}
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
            {showHeaders() ? (
              <div className="create-service-headers">
                <span className="bold-text service-header-margin">
                  Price{formInputs.serviceType === "per-pound" ? " / Lb" : ""}
                </span>
                <span className="bold-text service-header-margin">Taxable</span>
              </div>
            ) : null}
          </div>
          <div className="service-prices-container">{renderPrices()}</div>
        </div>
      ) : showCategoryScreen ? (
        renderNewCategoryScreen()
      ) : (
        <div className={`service-creation-container`}>
          <div className="service-creation-form">{renderServiceNameScreen()}</div>
        </div>
      )}

      <div className="service-prices-footer">
        <p className="service-footer-error-message new-service">{addNewServiceError} </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            if (showNewCategoryScreen) {
              handleShowNewCategoryScreen(false);
            } else {
              showHideNewServiceWizard(false);
              handleShowNewServicesPricingScreen(false);
            }
          }}
        >
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
      {addNewServiceCallInProgress || newServicePricingCallProgress ? (
        <BlockingLoader />
      ) : null}
    </Fragment>
  );
};

export default ServiceWizard;
