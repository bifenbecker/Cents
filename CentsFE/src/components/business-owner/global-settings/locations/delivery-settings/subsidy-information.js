import React from "react";
import PropTypes from "prop-types";

import {centsToDollarsDisplay} from "../utils/location";
import dollarIcon from "../../../../../assets/images/dollar-price.svg";

const SubsidyInformation = ({subsidy, text, showEachWayText, handleOnClick}) => {
  return (
    <>
      <div className="delivery-offers-container description-container">
        <span>{`For on-demand ${text} orders`}</span>
      </div>
      <div className="delivery-offers-container description-container">
        <img src={dollarIcon} alt="price" />
        <div onClick={handleOnClick}>
          {subsidy ? (
            <p>
              {centsToDollarsDisplay(subsidy)} Subsidy{" "}
              {showEachWayText ? "(each way)" : null}
            </p>
          ) : (
            <p>No Subsidy</p>
          )}
        </div>
      </div>
    </>
  );
};

SubsidyInformation.propTypes = {
  text: PropTypes.string,
  subsidy: PropTypes.number,
  handleOnClick: PropTypes.func,
  showEachWayText: PropTypes.bool,
};

SubsidyInformation.defaultProps = {
  subsidy: 0,
  handleOnClick: () => {},
  showEachWayText: false,
};

export default SubsidyInformation;
