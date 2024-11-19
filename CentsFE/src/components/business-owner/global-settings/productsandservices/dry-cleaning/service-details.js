// @ts-nocheck
import React, {Fragment, useEffect} from "react";

import starIcon from "../../../../../assets/images/star.svg";
import pencilIcon from "../../../../../assets/images/pencil.svg";
import dollarIcon from "../../../../../assets/images/Icon_Price.svg";
import categoryIcon from "../../../../../assets/images/Icon_Product_Category_Side_Panel.svg";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import TextField from "../../../../commons/textField/textField";
import TextArea from "../../../../commons/text-area/text-area";
import MaterialSelect from "../../../../commons/select/select";
import drycleaningIcon from "../../../../../assets/images/Icon_Dry_Cleaning.svg";
import {sortBy} from "lodash";

const ServiceDetails = (props) => {
  let {
    activeServiceId,
    fetchServiceDetails,
    isServiceDetailsLoading,
    serviceDetailsError,
    activeService,
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
  const renderOptions = () => {
    let categories = props.categoryForAService;
    categories = sortBy(categories, (o) => o.category.toLowerCase());
    const options = [
      {
        value: "new-category",
        label: "+ Add New Sub-Category",
        id: "",
        serviceCategoryTypeId: "",
      },
      ...categories.map((item) => ({
        label: item.category,
        value: item.category,
        id: item.id,
        serviceCategoryTypeId: item.serviceCategoryTypeId,
      })),
    ];
    return options;
  };
  const getPriceString = () => {
    if (!activeService) {
      return "";
    }
    let unit = "";
    if (activeService.serviceCategoryId === 1) {
      unit = "/lb";
    } else if (activeService.serviceCategoryId === 2) {
      unit = "/unit";
    }

    if (activeService.prices?.length === 0) {
      // Default price only
      return `${activeService.defaultPrice} ${unit}`;
    } else {
      let uniquePrices = [];
      for (let price of activeService.prices) {
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

  const handleCategories = (activeServiceDetails, newCategoryName) => {
    if (newCategoryName.value === "new-category") {
      props.handleShowNewCategoryScreenInDetails(true);
      return;
    } else {
      handleFieldChange(activeServiceDetails.id, "serviceCategoryId", newCategoryName.id);
    }
  };

  const getCategoryOption = (id) => {
    if (!props.drycleaningServicesList || !id) {
      return null;
    }
    let cat = props.drycleaningServicesList.find((cat) => cat.id === id);
    if (!cat) {
      return null;
    }
    return {
      value: cat.id,
      label: cat.category,
    };
  };

  return (
    <Fragment>
      {isServiceDetailsLoading || serviceDetailsUpdateInProgress ? (
        <BlockingLoader />
      ) : null}
      {serviceDetailsError ? (
        <p className="error-message">{serviceDetailsError}</p>
      ) : activeService ? (
        <>
          <div className="row services-row service-name-desc-row">
            <div>
              <div className="inline-icon-container">
                <img src={starIcon} alt="icon" />
                <TextField
                  isInline={true}
                  label="Service Name"
                  className="team-member-input"
                  value={activeService.name}
                  onChange={(e) => {
                    handleFieldChange(activeService.id, "name", e.target.value);
                  }}
                  onBlur={() => {
                    handleSave(activeService, searchText, searchInProgress);
                  }}
                />
              </div>
              <div className="inline-icon-container">
                <img src={categoryIcon} alt="icon" />
                <MaterialSelect
                  className="service-name-input"
                  placeholder="Sub-Category"
                  label="Sub-Category"
                  options={renderOptions()}
                  smallHeight
                  onChange={(evt) => {
                    handleCategories(activeService, evt);
                    if (evt.value !== "new-category") {
                      handleSave(
                        {
                          ...activeService,
                          serviceCategoryId: evt.id,
                        },
                        searchText,
                        searchInProgress,
                        !servicesRefresh
                      );
                    }
                  }}
                  value={getCategoryOption(activeService.serviceCategoryId)}
                  maxMenuHeight={180}
                  menuShouldScrollIntoView={true}
                />
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
                <img src={drycleaningIcon} alt="icon" />
                <TextField
                  isInline={true}
                  label="# of Pieces"
                  className="team-member-input"
                  value={activeService.piecesCount}
                  onChange={(e) => {
                    handleFieldChange(activeService.id, "piecesCount", e.target.value);
                  }}
                  onBlur={() => {
                    handleSave(activeService, searchText, searchInProgress);
                  }}
                />
              </div>
              <div className="inline-icon-container">
                <img src={pencilIcon} alt="icon" />
                <TextArea
                  isInline={true}
                  label="Description"
                  className="team-member-input inline description-area"
                  value={activeService.description || ""}
                  onChange={(e) => {
                    handleFieldChange(activeService.id, "description", e.target.value);
                  }}
                  onBlur={() => {
                    handleSave(activeService, searchText, searchInProgress);
                  }}
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
