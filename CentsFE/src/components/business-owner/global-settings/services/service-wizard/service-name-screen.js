import React, {Fragment} from "react";
import role_side_panel from "../../../../../assets/images/Icon_Role_Side_Panel.svg";
import TextField from "../../../../commons/textField/textField";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import MaterialSelect from "../../../../commons/select/select";
import notesIcon from "../../../../../assets/images/Icon_Notes_Cycle_Details.svg";
import {sortBy} from "lodash";
import PropTypes from "prop-types";

const ServiceNameScreen = ({
  isInServiceEditMode,
  handleFormInput,
  formInputs,
  handleCategories,
  categoryForAService,
  perPoundPricingStructureId,
}) => {
  const renderOptions = () => {
    let categories = sortBy(categoryForAService, (o) => o.category.toLowerCase());
    const oldOptions = [
      ...categories.map((item) => ({
        label: item.category === "PER_POUND" ? "Wash & Fold" : item.category,
        value: item.category === "PER_POUND" ? "Wash & Fold" : item.category,
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

    const addNewCategory = [
      {
        value: "new-category",
        label: "+ Add New Sub-Category",
        id: "",
        serviceCategoryTypeId: "",
      },
    ];

    let options =
      formInputs.serviceType === "fixed-price"
        ? washAndFold.concat(noWashAndFoldOptions)
        : washAndFold;
    options =
      formInputs.serviceType === "fixed-price" ? addNewCategory.concat(options) : options;
    return options;
  };

  return (
    <Fragment>
      <div className={`product-wizard-main-container`}>
        {!isInServiceEditMode && (
          <div className="type-of-service-selection">
            <div className="service-radio-button">
              <input
                type="radio"
                value="per-pound"
                name="serviceType"
                onChange={(evt) => {
                  handleFormInput(evt);
                }}
                checked={formInputs.serviceType === "per-pound"}
              />
              <p>Priced Per Lb</p>
            </div>
            <div className="service-radio-button">
              <input
                type="radio"
                value="fixed-price"
                name="serviceType"
                onChange={(evt) => {
                  handleFormInput(evt);
                }}
                checked={formInputs.serviceType === "fixed-price"}
              />
              <p>Fixed Price</p>
            </div>
          </div>
        )}
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
            {formInputs.servicePricingStructureId !== perPoundPricingStructureId[0].id ? (
              <MaterialSelect
                className="service-name-input service-subcategory"
                placeholder="Sub-Category"
                label="Sub-Category"
                smallHeight
                options={renderOptions()}
                onChange={(evt) => {
                  handleCategories(evt);
                }}
                value={formInputs?.selectedCategory}
                maxMenuHeight={180}
                menuShouldScrollIntoView={true}
              />
            ) : (
              <div className="service-input-containers disabled-subcategory-box">
                <p>{"Wash & Fold"}</p>
              </div>
            )}
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
        </div>
      </div>
    </Fragment>
  );
};

ServiceNameScreen.propTypes = {
  categoryForAService: PropTypes.object,
  isInServiceEditMode: PropTypes.bool,
  handleFormInput: PropTypes.func,
  formInputs: PropTypes.object,
  handleCategories: PropTypes.func,
};

export default ServiceNameScreen;
