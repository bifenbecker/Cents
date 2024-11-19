import React from "react";
import exitIcon from "../../../../assets/images/Icon_Exit_Side_Panel.svg";
import categoryIcon from "../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import PropTypes from "prop-types";
import cx from "classnames";

const NewCategoryScreen = ({
  showNewProductsPricingScreen,
  handleShowNewCategoryScreenInDetails,
  handleAddNewCategory,
  newCategory,
}) => {
  return (
    <div
      className={cx("product-wizard-main-container", {
        "flex-reset": showNewProductsPricingScreen,
      })}
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
            value={newCategory || ""}
            onChange={(evt) => handleAddNewCategory(evt.target.value)}
            maxLength="50"
          />
        </div>
      </div>
    </div>
  );
};

NewCategoryScreen.propTypes = {
  showNewProductsPricingScreen: PropTypes.func,
  handleShowNewCategoryScreenInDetails: PropTypes.func,
  handleAddNewCategory: PropTypes.func,
  newCategory: PropTypes.object,
};

export default NewCategoryScreen;
