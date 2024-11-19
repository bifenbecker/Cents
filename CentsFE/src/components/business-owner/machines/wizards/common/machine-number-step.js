import React, {useState} from "react";
import PropTypes from "prop-types";

import hashIcon from "../../../../../assets/images/hash.svg";

import {validateMachineName} from "../../../../../api/business-owner/machines";

import WizardStep from "../../common/wizard-step";
import TextField from "../../../../commons/textField/textField";

const MachineNumberStep = (props) => {
  const {
    machine,
    setMachine,
    isLoading: parentIsLoading,
    onSubmit: parentOnSubmit,
    errorMessage: parentError,
    ...rest
  } = props;

  const {currentStep, totalSteps} = props;
  const shouldValidate = totalSteps !== currentStep;

  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(false);

  const updateMachineName = (name) => setMachine((state) => ({...state, name}));

  const validateName = async () => {
    try {
      setValidating(true);
      setError();
      await validateMachineName({
        name: machine?.name,
        modelId: machine?.model?.id,
        storeId: machine?.storeId,
      });
      return true;
    } catch (e) {
      setError(e?.response?.data?.error || e?.messge);
      return false;
    } finally {
      setValidating(false);
    }
  };

  return (
    <WizardStep
      header="Machine #"
      isSaveDisabled={!machine?.name}
      isLoading={validating || parentIsLoading}
      errorMessage={error || parentError}
      onSubmit={async () => {
        let isValid = true;
        if (shouldValidate) {
          isValid = await validateName();
        }
        if (isValid) {
          parentOnSubmit();
        }
      }}
      {...rest}
    >
      <div className="description-with-input">
        <p>What's the machine number?</p>
        <div className="input-container machine-number">
          <img src={hashIcon} alt="hash" />
          <TextField
            label={`${(machine?.type === 'WASHER' ? "Washer" : "Dryer") || "M"} # `}
            prefix={`${machine?.type?.charAt(0) || "M"}-`}
            value={machine?.name}
            onChange={(event) =>
              updateMachineName(event?.target?.value?.replace(/[^0-9a-zA-Z]/g, ""))
            }
            maxLength={8}
          />
        </div>
      </div>
    </WizardStep>
  );
};

MachineNumberStep.propTypes = {
  machine: PropTypes.object.isRequired,
  setMachine: PropTypes.func.isRequired,
};

export default MachineNumberStep;
