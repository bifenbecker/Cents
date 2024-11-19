import React, {Fragment, useEffect} from "react";

import starIcon from "../../../../assets/images/star.svg";
import pencilIcon from "../../../../assets/images/pencil.svg";
import dollarIcon from "../../../../assets/images/Icon_Price.svg";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import TextField from "../../../commons/textField/textField";
import TextArea from "../../../commons/text-area/text-area";

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
  } = props;

  useEffect(() => {
    if (!activeServiceId) {
      return;
    }
    fetchServiceDetails(activeServiceId);
  }, [activeServiceId, fetchServiceDetails, numberOfActivePriceUpdates]);

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
