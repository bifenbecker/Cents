import React from "react";
import PropTypes from "prop-types";

import blueVanIcon from "../../../../../assets/images/Blue-Van.svg";
import {deliveryWizardTypes} from "../constants";

const OwnDriverWizardPill = (props) => {
  const {setDeliveryWizard} = props;

  return (
    <div
      className="service-wizard-pill-item"
      onClick={() => setDeliveryWizard(deliveryWizardTypes.OWN_DELIVERY_SETTINGS)}
    >
      <div className="image-wrapper">
        <img src={blueVanIcon} alt="Van Icon" />
      </div>
      <span className="text">I have my own vehicles &#38; drivers</span>
      <span className="sub-text">Fixed delivery windows</span>
    </div>
  );
};

OwnDriverWizardPill.propTypes = {
  setDeliveryWizard: PropTypes.func.isRequired,
};

export default OwnDriverWizardPill;
