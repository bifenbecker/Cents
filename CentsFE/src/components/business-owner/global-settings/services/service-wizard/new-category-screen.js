import React from "react";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import PropTypes from "prop-types";

const NewCategoryScreen = ({handleShowNewCategoryScreen, handleAddNewCategory}) => {
  return (
    <div className="product-wizard-main-container">
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

NewCategoryScreen.propTypes = {
  handleShowNewCategoryScreen: PropTypes.func,
  handleAddNewCategory: PropTypes.func,
};

export default NewCategoryScreen;
