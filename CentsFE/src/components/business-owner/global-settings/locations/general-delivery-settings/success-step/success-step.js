import React from "react";

import OnDemandWizardPill from "../../common/on-demand-wizard-pill";
import OwnDriverWizardPill from "../../common/own-driver-wizard-pill";
import WizardSuccess from "../../common/wizard-success/wizard-success";

const SuccessStep = (props) => {
  const {setDeliveryWizard, isOwndriverSettingsActive, isOnDemandSettingsActive} = props;

  return (
    <WizardSuccess
      successMessage="Your service settings have been saved."
      headerText={
        isOwndriverSettingsActive && isOnDemandSettingsActive
          ? null
          : isOwndriverSettingsActive
          ? "Do you want to set up on-demand delivery using Cents’ delivery partner?"
          : "Do you want to set up delivery using your own vehicles and drivers?"
      }
      className="general-settings-success"
      onClose={() => setDeliveryWizard(null)}
    >
      {isOwndriverSettingsActive && isOnDemandSettingsActive && (
        <button
          className="btn btn-text cancel-button"
          onClick={() => setDeliveryWizard(null)}
        >
          Close
        </button>
      )}

      <div className="service-wizard-types">
        {!isOwndriverSettingsActive && (
          <OwnDriverWizardPill setDeliveryWizard={setDeliveryWizard} />
        )}
        {!isOnDemandSettingsActive && (
          <OnDemandWizardPill setDeliveryWizard={setDeliveryWizard} />
        )}
      </div>
    </WizardSuccess>
  );
};

export default SuccessStep;
