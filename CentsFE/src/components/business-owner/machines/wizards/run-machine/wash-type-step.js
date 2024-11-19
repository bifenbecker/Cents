import React from "react";

import {MACHINE_NAMES, SERVICE_TYPES} from "../../constants";

import technicalIcon from "../../../../../assets/images/technical.svg";
import technicalGrayIcon from "../../../../../assets/images/technical_gray.svg";
import personIcon from "../../../../../assets/images/person.svg";
import personGrayIcon from "../../../../../assets/images/person_gray.svg";

import WizardStep from "../../common/wizard-step";
import WizardRadioSelector from "../../../../commons/wizardRadioSelector/wizardRadioSelector";

const WashTypeStep = (props) => {
  const {runMachineData, setRunMachineData, selectedMachine, moveTostep, ...rest} = props;

  const onChange = (type) => {
    setRunMachineData((state) => ({
      // if the changed type is not the same as previous selected type,
      // reset all variables
      ...(state.serviceType !== type
        ? {quantity: 1, serviceType: type}
        : {...state, serviceType: type}),
    }));
  };

  return (
    <WizardStep
      header={`Run ${selectedMachine?.prefix}-${selectedMachine?.name}`}
      isSaveDisabled={!runMachineData.serviceType}
      moveToStep={props.setCurrentStep}
      {...rest}
    >
      <div className="wizard-step-section middle-section">
        <p className="header">
          {`Which type of ${MACHINE_NAMES[selectedMachine?.model?.type]}`}
        </p>
        <div className="wizard-radio-selectors-container">
          <WizardRadioSelector
            activeImage={technicalIcon}
            inactiveImage={technicalGrayIcon}
            label="Technical"
            onClick={() => onChange(SERVICE_TYPES.technicalService)}
            isActive={runMachineData?.serviceType === SERVICE_TYPES.technicalService}
            className="wash-type-selector"
          />

          <WizardRadioSelector
            activeImage={personIcon}
            inactiveImage={personGrayIcon}
            label="Customer Service"
            onClick={() => onChange(SERVICE_TYPES.customerService)}
            isActive={runMachineData?.serviceType === SERVICE_TYPES.customerService}
            className="wash-type-selector"
          />
        </div>
      </div>
    </WizardStep>
  );
};

export default WashTypeStep;
