import React from "react";
import PropTypes from "prop-types";

import dollarIcon from "../../../../../assets/images/dollar.svg";

import {MACHINE_TYPES} from "../../constants";

import WizardStep from "../../common/wizard-step";
import CentsInput from "../../../../commons/currency-input/cents-input";
import TextField from "../../../../commons/textField/textField";

const MachinePricingStep = (props) => {
  const {machine, setMachine, ...rest} = props;

  const updatePerPerTurn = (pricePerTurnInCents) =>
    setMachine((state) => ({...state, pricePerTurnInCents, turnTimeInMinutes: null}));

  const updateTurnTime = (turnTimeInMinutes) =>
    setMachine((state) => ({...state, turnTimeInMinutes, pricePerTurnInCents: 25}));

  const isWasherSelected = machine?.type === MACHINE_TYPES.washer;
  const isSaveDisabled = isWasherSelected
    ? !machine?.pricePerTurnInCents || !machine?.pricePerTurnInCents > 0
    : !machine?.turnTimeInMinutes || !machine?.turnTimeInMinutes > 0;

  return (
    <WizardStep
      header={`${machine?.id ? "Confirm " : ""}Pricing`}
      isSaveDisabled={isSaveDisabled}
      {...rest}
    >
      <div className="description-with-input">
        {isWasherSelected ? (
          <>
            <p>What's the price per turn?</p>
            <div className="input-container pricing">
              <img src={dollarIcon} alt="dollar" />
              <CentsInput
                suffix="/ turn"
                value={machine?.pricePerTurnInCents}
                onCentsChange={updatePerPerTurn}
                className="pricing-input"
                maxLimit={1000}
              />
            </div>
          </>
        ) : (
          <>
            <p>
              How many minutes of dryer time <br /> does $0.25 buy for this dryer?
            </p>
            <TextField
              suffix="mins / $0.25"
              value={machine?.turnTimeInMinutes}
              maxLength={2}
              onChange={(event) => {
                const value = event?.target?.value.replace(/[^0-9]/g, "");
                updateTurnTime(value ? Math.floor(Number(value)) : "");
              }}
              className="pricing-input"
            />
          </>
        )}
      </div>
    </WizardStep>
  );
};

MachinePricingStep.propTypes = {
  machine: PropTypes.object.isRequired,
  setMachine: PropTypes.func.isRequired,
};

export default MachinePricingStep;
