import React from "react";

import OnDemandWizardPill from "./on-demand-wizard-pill";
import OwnDriverWizardPill from "./own-driver-wizard-pill";
import WizardSuccess from "./wizard-success/wizard-success";

const DeliverySettingsSuccess = (props) => {
  const {setDeliveryWizard} = props;

  const onDeliveryWizardClose = () => {
    setDeliveryWizard(null);
  };

  return (
    <WizardSuccess
      successMessage="You have enabled pickup & delivery service at this store."
      headerText="How will you be providing this service?"
      className="general-settings-success"
      onClose={onDeliveryWizardClose}
    >
      <span className="note-text">
        *NOTE: You can utilize <span className="bolded">both</span> your own drivers AND
        our on-demand delivery partners. Choose one to get started.
      </span>
      <div className="service-wizard-types">
        <OwnDriverWizardPill setDeliveryWizard={setDeliveryWizard} />
        <OnDemandWizardPill setDeliveryWizard={setDeliveryWizard} />
      </div>
    </WizardSuccess>
  );
};

export default DeliverySettingsSuccess;
