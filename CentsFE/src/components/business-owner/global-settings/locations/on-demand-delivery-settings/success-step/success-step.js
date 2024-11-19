import React, {useState} from "react";

import OwnDriverWizardPill from "../../common/own-driver-wizard-pill";
import WizardSuccess from "../../common/wizard-success/wizard-success";
import SetServicePricingWarningModal from "../../common/set-services-wizard-pill";
import ServicePricingModal from "../../common/service-modal/set-servicepricing-warning-modal";

const SuccessStep = (props) => {
  const {
    setDeliveryWizard,
    isOwndriverSettingsActive,
    isGeneralDeliverySettingsActive,
  } = props;
  const [showWarningModal, setShowWarningModal] = useState(false);

  const onClose = () => {
    if (!isGeneralDeliverySettingsActive) {
      setShowWarningModal(true);
    } else {
      setDeliveryWizard(null);
    }
  };

  const onClick = () => setDeliveryWizard(null);
  const onCancel = () => setShowWarningModal(false);

  return (
    <WizardSuccess
      successMessage="Your on-demand delivery settings have been saved."
      headerText={
        isOwndriverSettingsActive && !isGeneralDeliverySettingsActive
          ? "Next you'll need to set up your service pricing and availability for pickup and delivery at this store."
          : !isOwndriverSettingsActive
          ? "Do you want to set up delivery using your own vehicles and drivers?"
          : ""
      }
      className="on-demand-settings-success"
      onClose={onClose}
    >
      {showWarningModal && <ServicePricingModal onClick={onClick} onCancel={onCancel} />}
      {isOwndriverSettingsActive && isGeneralDeliverySettingsActive ? (
        <button className="btn btn-text cancel-button" onClick={onClose}>
          Close
        </button>
      ) : null}
      <div className="service-wizard-types">
        {!isOwndriverSettingsActive && (
          <OwnDriverWizardPill setDeliveryWizard={setDeliveryWizard} />
        )}
        {!isGeneralDeliverySettingsActive && (
          <SetServicePricingWarningModal setDeliveryWizard={setDeliveryWizard} />
        )}
      </div>
    </WizardSuccess>
  );
};

export default SuccessStep;
