import React from "react";
import PropTypes from "prop-types";

import blueCarIcon from "../../../../../assets/images/Blue-Car.svg";
import {deliveryWizardTypes} from "../constants";

const OnDemandWizardPill = (props) => {
  const {setDeliveryWizard} = props;

  return (
    <div
      className="service-wizard-pill-item"
      onClick={() => setDeliveryWizard(deliveryWizardTypes.ON_DEMAND_DELIVERY_SETTINGS)}
    >
      <div className="image-wrapper">
        <img src={blueCarIcon} alt="Car Icon" />
      </div>
      <span className="text">I will use Cents’ delivery partner</span>
      <span className="sub-text">On-demand delivery during your set hours</span>
    </div>
  );
};

OnDemandWizardPill.propTypes = {
  setDeliveryWizard: PropTypes.func.isRequired,
};

export default OnDemandWizardPill;
