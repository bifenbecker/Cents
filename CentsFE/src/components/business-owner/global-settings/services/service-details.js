import React, {Fragment, useEffect} from "react";

import starIcon from "../../../../assets/images/star.svg";
import pencilIcon from "../../../../assets/images/pencil.svg";
import dollarIcon from "../../../../assets/images/Icon_Price.svg";
import categoryIcon from "../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import TextField from "../../../commons/textField/textField";
import TextArea from "../../../commons/text-area/text-area";
import MaterialSelect from "../../../commons/select/select";
import {sortBy} from "lodash";
import {WASH_AND_FOLD_SUBCATEGORY} from "../../../../constants";

const ServiceDetails = (props) => {
  let {
    activeServiceId,
    fetchServiceDetails,
    isServiceDetailsLoading,
    serviceDetailsError,
    activeServiceDetails,
    handleFieldChange,
    handleSave,
    serviceDetailsUpdateError,
    serviceDetailsUpdateInProgress,
    numberOfActivePriceUpdates,
    searchText,
    searchInProgress,
    servicesRefresh,
  } = props;

  useEffect(() => {
    if (!activeServiceId) {
      return;
    }
    fetchServiceDetails(activeServiceId);
  }, [activeServiceId, fetchServiceDetails, numberOfActivePriceUpdates]);
  // const [newCategory, setNewCategory] = useState("");
  const getPriceString = () => {
    if (!activeServiceDetails) {
      return "";
    }

    let unit = "";
    if (activeServiceDetails.serviceCategoryId === 1) {
      unit = "/lb";
    } else if (activeServiceDetails.serviceCategoryId === 2) {
      unit = "/unit";
    }

    if (activeServiceDetails.prices?.length === 0) {
      // Default price only
      return `${activeServiceDetails.defaultPrice} ${unit}`;
    } else {
      let uniquePrices = [];
      for (let price of activeServiceDetails.prices) {
        if (!uniquePrices.includes(price.storePrice)) {
          uniquePrices.push(price.storePrice);
        }
      }
      let numberOfUniquePrices = uniquePrices.length;
      if (numberOfUniquePrices === 1) {
        return `$${Number(uniquePrices[0]).toFixed(2)} ${unit}`;
      } else {
        return `${numberOfUniquePrices} Prices ${unit}`;
      }
    }
  };

  const getCategoryOption = (id) => {
    if (!props.servicesCategories || !id) {
      return null;
    }
    let cat = props.servicesCategories.find((cat) => cat.id === id);
    if (!cat) {
      return null;
    }
    return {
      value: cat.id,
      label: cat.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : cat.category,
    };
  };

  const handleCategories = (activeServiceDetails, newCategoryName) => {
    if (newCategoryName.value === "new-category") {
      props.handleShowNewCategoryScreenInDetails(true);
      return;
    } else {
      handleFieldChange(activeServiceDetails.id, "serviceCategoryId", newCategoryName.id);
    }
  };

  const renderOptions = () => {
    let categories = props.categoryForAService;
    categories = sortBy(categories, (o) => o.category.toLowerCase());
    const oldoptions = [
      ...categories.map((item) => ({
        label:
          item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
        value:
          item.category === WASH_AND_FOLD_SUBCATEGORY ? "Wash & Fold" : item.category,
        id: item.id,
        serviceCategoryTypeId: item.serviceCategoryTypeId,
      })),
    ];
    const washandfold = oldoptions.filter((item) => {
      return item.label === "Wash & Fold";
    });

    const nowashandfoldoptions = oldoptions.filter((item) => {
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

    let options = washandfold.concat(nowashandfoldoptions);
    options = addNewCategory.concat(options);
    return options;
  };

  return (
    <Fragment>
      {isServiceDetailsLoading || serviceDetailsUpdateInProgress ? (
        <BlockingLoader />
      ) : null}
      {serviceDetailsError ? (
        <p className="error-message">{serviceDetailsError}</p>
      ) : activeServiceDetails ? (
        <>
          <div className="row services-row service-name-desc-row">
            <div>
              <div className="inline-icon-container">
                <img src={starIcon} alt="icon" />
                <TextField
                  isInline={true}
                  label="Service Name"
                  className="team-member-input"
                  value={activeServiceDetails.name}
                  onChange={(e) => {
                    handleFieldChange(activeServiceDetails.id, "name", e.target.value);
                  }}
                  onBlur={() => {
                    handleSave(activeServiceDetails, searchText, searchInProgress);
                  }}
                  // error={productDetailsErrors.productName}
                />
              </div>
              <div className="inline-icon-container">
                <img src={categoryIcon} alt="icon" />
                {activeServiceDetails?.pricingStructure?.type === "PER_POUND" ? (
                  <div>
                    <p>{"Wash & Fold"}</p>
                  </div>
                ) : (
                  <MaterialSelect
                    className="service-name-input"
                    placeholder="Sub-Category"
                    label="Sub-Category"
                    options={renderOptions()}
                    smallHeight
                    onChange={(evt) => {
                      handleCategories(activeServiceDetails, evt);
                      if (evt.value !== "new-category") {
                        handleSave(
                          {
                            ...activeServiceDetails,
                            serviceCategoryId: evt.id,
                          },
                          searchText,
                          searchInProgress,
                          !servicesRefresh
                        );
                      }
                    }}
                    value={getCategoryOption(activeServiceDetails.serviceCategoryId)}
                    maxMenuHeight={180}
                    menuShouldScrollIntoView={true}
                  />
                )}
              </div>
              <div className="inline-icon-container clickable">
                <img src={dollarIcon} alt="icon" />
                <div>
                  <p
                    onClick={() => {
                      props.handlePriceDetailsClick();
                    }}
                  >
                    {getPriceString()}
                  </p>
                </div>
              </div>
              <div className="inline-icon-container">
                <img src={pencilIcon} alt="icon" />
                <TextArea
                  isInline={true}
                  label="Description"
                  className="team-member-input inline description-area"
                  value={activeServiceDetails.description || ""}
                  onChange={(e) => {
                    handleFieldChange(
                      activeServiceDetails.id,
                      "description",
                      e.target.value
                    );
                  }}
                  onBlur={() => {
                    handleSave(activeServiceDetails, searchText, searchInProgress);
                  }}
                  // error={productDetailsErrors.productName}
                />
              </div>
            </div>
          </div>
          <div className="save-button-container">
            <p className="error-message">{serviceDetailsUpdateError}</p>
          </div>
        </>
      ) : null}
    </Fragment>
  );
};

export default ServiceDetails;
