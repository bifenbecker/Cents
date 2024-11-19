import React, {useState, Fragment, useEffect} from "react";

// Icons
import productNameIcon from "../../../../assets/images/Icon_Role_Side_Panel.svg";
import categoryIcon from "../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import notesIcon from "../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import barcodeIcon from "../../../../assets/images/Icon_Barcode_Side_Panel.svg";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";

// Commons
import MaterialSelect from "../../../commons/select/select";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import {Progress} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ProductPricingList from "../common/product-pricing-list";

const ProductWizard = (props) => {
  const [formInputs, setFormInputs] = useState({
    description: "",
    productName: "",
    categoryId: null,
    sku: "",
    newCategory: "",
    selectedCategory: null,
  });

  /* Whenever a new category is created, 'props.productCategories' changes. We run this effect to select the newly
	created category by default. */

  useEffect(
    () => {
      if (formInputs.newCategory) {
        const category = props.productCategories.find(
          (categoryItem) => categoryItem.name === formInputs.newCategory
        );
        setFormInputs((prevInputs) => ({
          ...prevInputs,
          selectedCategory: {label: category.name, value: category.id},
          categoryId: category.id,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.productCategories]
  );

  const renderOptions = () => {
    const categories = props.productCategories;
    const options = [
      {value: "new-category", label: "+ Add New Category"},
      ...categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ];

    return options;
  };

  const handleFormInputs = (evt) => {
    let newInput;
    if (evt.label) {
      if (evt.value === "new-category") {
        props.handleShowNewCategoryScreen(true);
        return;
      }
      newInput = {
        categoryId: evt.value,
        selectedCategory: {label: evt.label, value: evt.value},
      };
    } else {
      newInput = {
        [evt.target.name]: evt.target.value,
      };
    }
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      ...newInput,
    }));
  };

  const handleDisableStatus = () => {
    if (!props.showNewCategoryScreen) {
      const {productName, categoryId} = formInputs;
      return !([productName, categoryId].filter(Boolean).length === 2);
    } else {
      const {newCategory} = formInputs;
      return newCategory ? false : true;
    }
  };

  const handleSave = () => {
    if (props.showNewCategoryScreen) {
      props.createNewCategory(formInputs.newCategory);
    } else if (!props.showNewProductsPricingScreen) {
      props.handleShowNewProductsPricingScreen(true);
    } else {
      const {productName, description, categoryId, sku} = formInputs;
      const inventoryItems = [...props.newProductInventoryItems];
      const data = {
        productName,
        description,
        categoryId,
        sku,
        inventoryItems,
      };
      props.createNewProduct(data, {withArchived: props.showArchivedTasks});
    }
  };

  const renderErrorMessage = () => {
    if (props.showNewCategoryScreen && props.newCategoryError) {
      return props.newCategoryError;
    } else if (props.showNewProductsPricingScreen && props.newProductPricingError) {
      return props.newProductPricingError;
    } else if (props.newProductError) {
      return props.newProductError;
    } else return null;
  };

  const renderNewCategoryScreen = () => {
    return (
      <div className="product-wizard-form-container">
        <div className="product-wizard-form-input">
          <img src={categoryIcon} alt="" />
          <input
            type="text"
            name="newCategory"
            placeholder="Category Name"
            onChange={handleFormInputs}
            maxLength="50"
          />
        </div>
      </div>
    );
  };

  const renderNewProductScreen = () => (
    <Fragment>
      <div className="product-wizard-form-container">
        <div className="product-wizard-form-input">
          <img src={productNameIcon} alt="" />
          <div className="product-wizard-product-name-container">
            <input
              name="productName"
              type="text"
              required
              onChange={handleFormInputs}
              value={formInputs.productName}
              maxLength="50"
            />
            <label htmlFor="productName">Product Name</label>
          </div>
        </div>
        <div className="product-wizard-form-input categories-dropdown">
          <img src={categoryIcon} alt="" />
          <MaterialSelect
            className="product-categories-dropdown"
            placeholder="Categories"
            options={renderOptions()}
            smallHeight
            onChange={handleFormInputs}
            value={formInputs.selectedCategory}
            maxMenuHeight={180}
            menuShouldScrollIntoView={true}
          />
        </div>
        <div className="product-wizard-form-input product-notes">
          <img src={notesIcon} alt="" />
          <textarea
            type="text"
            name="description"
            placeholder="Description"
            onChange={handleFormInputs}
            value={formInputs.description}
            maxLength="150"
          />
        </div>
        <div className="product-wizard-form-input">
          <img src={barcodeIcon} alt="" />
          <input
            type="text"
            name="sku"
            placeholder="#SKU"
            onChange={handleFormInputs}
            value={formInputs.sku}
          />
        </div>
      </div>
    </Fragment>
  );

  const renderPrices = () => {
    const pricesList = props?.newProductInventoryItems?.map((storeItem) => ({
      // Required fields for handling change
      id: storeItem.id,
      storeId: storeItem.storeId,
      // Required fields for UI view
      title: storeItem.store.name,
      price: storeItem.price,
      quantity: storeItem.quantity,
      isSelected: storeItem.isFeatured,
      isTaxable: storeItem.isTaxable,
    }));
    return (
      <ProductPricingList
        canApplyAll
        onApplyAll={props.handleApplyAll}
        showSelectAll
        handleSelectAll={props.handleSelectAll}
        fromPromotions={false}
        items={pricesList}
        unselectedMessage="Not featured in this location"
        handleChange={(item, field, value) =>
          props.handleChange(item.id, item.storeId, field, value)
        }
        keyExtractor={(_item, index) => `price-item-${index}`}
      />
    );
  };

  const renderWizardContent = () => {
    if (props.showNewCategoryScreen) {
      return renderNewCategoryScreen();
    } else if (props.showNewProductsPricingScreen) {
      return renderPrices();
    } else return renderNewProductScreen();
  };

  return (
    <Fragment>
      {!props.showNewCategoryScreen && (
        <Fragment>
          <div className="locations-card-header wizard-header">
            {props.showNewProductsPricingScreen && (
              <div
                className="back-button-container"
                onClick={() => {
                  props.handleShowNewProductsPricingScreen(false);
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="back-chevron-icon" />
                <button className="btn btn-text-only cancel-button">{`Back`}</button>
              </div>
            )}
            <p>
              {props.showNewProductsPricingScreen ? "New Product Pricing" : "New Product"}
            </p>
          </div>
          <Progress
            value={props.showNewProductsPricingScreen ? 95 : 50}
            className="_progressbar"
          />
        </Fragment>
      )}
      <div
        className={`product-wizard-main-container ${
          props.showNewProductsPricingScreen && "flex-reset"
        }`}
      >
        {props.showNewCategoryScreen && (
          <div className="product-wizard-exit-icon-container">
            <img
              src={exitIcon}
              alt=""
              onClick={() => {
                props.handleShowNewCategoryScreen(false);
              }}
            />
          </div>
        )}
        <p className="product-wizard-heading">
          {props.showNewCategoryScreen && "Add New Category"}
        </p>
        {renderWizardContent()}
      </div>
      <div className="service-prices-footer">
        <p className="service-footer-error-message">{renderErrorMessage()} </p>
        <button
          className="btn btn-text-only cancel-button"
          onClick={() => {
            if (props.showNewCategoryScreen) {
              props.handleShowNewCategoryScreen(false);
            } else {
              props.showHideNewProductWizard(false);
              props.handleShowNewProductsPricingScreen(false);
            }
          }}
        >
          Cancel
        </button>
        <button
          className="btn-rounded btn-theme"
          disabled={handleDisableStatus()}
          onClick={handleSave}
        >
          {props.showNewProductsPricingScreen ? "SAVE" : "NEXT"}
        </button>
      </div>
      {props.newCategoryCallInProgress ||
      props.newProductCallInProgress ||
      props.newProductPricingCallProgress ? (
        <BlockingLoader />
      ) : null}
    </Fragment>
  );
};

export default ProductWizard;
