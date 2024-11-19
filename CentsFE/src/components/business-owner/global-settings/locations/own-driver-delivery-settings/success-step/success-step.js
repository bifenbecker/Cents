import React, {useState} from "react";

import OnDemandWizardPill from "../../common/on-demand-wizard-pill";
import WizardSuccess from "../../common/wizard-success/wizard-success";
import SetServicePricingWarningModal from "../../common/set-services-wizard-pill";
import ServicePricingModal from "../../common/service-modal/set-servicepricing-warning-modal";

const SuccessStep = (props) => {
  const {
    isOnDemandSettingsActive,
    setDeliveryWizard,
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
      successMessage="Your driver pickup & delivery settings have been saved."
      headerText={
        isOnDemandSettingsActive && !isGeneralDeliverySettingsActive
          ? "Next you'll need to set up your service pricing and availability for pickup and delivery at this store."
          : !isOnDemandSettingsActive
          ? "Do you want to set up on-demand delivery using Cents’ delivery partner?"
          : ""
      }
      className="own-driver-settings-success"
      onClose={onClose}
    >
      {showWarningModal && <ServicePricingModal onClick={onClick} onCancel={onCancel} />}
      {isOnDemandSettingsActive && isGeneralDeliverySettingsActive ? (
        <button className="btn btn-text cancel-button" onClick={onClose}>
          Close
        </button>
      ) : null}
      <div className="service-wizard-types">
        {!isOnDemandSettingsActive && (
          <OnDemandWizardPill setDeliveryWizard={setDeliveryWizard} />
        )}
        {!isGeneralDeliverySettingsActive && (
          <SetServicePricingWarningModal setDeliveryWizard={setDeliveryWizard} />
        )}
      </div>
    </WizardSuccess>
  );
};

export default SuccessStep;
