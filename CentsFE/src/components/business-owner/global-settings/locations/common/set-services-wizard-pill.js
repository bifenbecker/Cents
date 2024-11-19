import React from "react";
import PropTypes from "prop-types";

import ServiceSettingDeliveryIcon from "../../../../../assets/images/Service-Setting-for-Delivery.svg";
import {deliveryWizardTypes} from "../constants";

const SetServicePricingWarningModal = (props) => {
  const {setDeliveryWizard} = props;
  const handleSetDeliveryWizard = () =>
    setDeliveryWizard(deliveryWizardTypes.GENERAL_DELIVERY_SETTINGS);

  return (
    <div className="service-wizard-pill-item" onClick={handleSetDeliveryWizard}>
      <div className="image-wrapper image-margin-bottom">
        <img src={ServiceSettingDeliveryIcon} alt="Van Icon" />
      </div>
      <span className="text">Continue on to set service pricing & availability</span>
    </div>
  );
};

SetServicePricingWarningModal.propTypes = {
  setDeliveryWizard: PropTypes.func.isRequired,
};

export default SetServicePricingWarningModal;
