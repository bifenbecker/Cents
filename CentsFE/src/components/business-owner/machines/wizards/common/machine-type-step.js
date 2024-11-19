import React from "react";
import cx from "classnames";
import PropTypes from "prop-types";

import washerIcon from "../../../../../assets/images/washer.svg";
import dryerIcon from "../../../../../assets/images/dryer.svg";
import selectedRadio from "../../../../../assets/images/selected_radio.svg";
import unSelectedRadio from "../../../../../assets/images/unselected_radio.svg";
import selectedWasherIcon from "../../../../../assets/images/Icon_Washer_Selected.svg";
import selectedDryerIcon from "../../../../../assets/images/Icon_Dryer_Selected_Large.svg";

import {MACHINE_TYPES} from "../../constants";

import WizardStep from "../../common/wizard-step";

const MachineTypeStep = (props) => {
  const {machine, setMachine, ...rest} = props;

  const isWasherSelected = machine?.type === MACHINE_TYPES.washer;
  const isDryerSelected = machine?.type === MACHINE_TYPES.dryer;

  const onChange = (type) => {
    setMachine((state) => ({
      ...state,
      type,
      // if the changed type is not the same as one in state,
      // reset all variables related to type.
      ...(state.type !== type
        ? {model: null, turnTimeInMinutes: null, pricePerTurnInCents: null}
        : {}),
    }));
  };

  return (
    <WizardStep header="Machine Type" isSaveDisabled={!machine?.type} {...rest}>
      <div className="type-selectors-container">
        <div
          onClick={() => onChange("WASHER")}
          className={cx("type-selector", isWasherSelected && "active")}
        >
          <img src={isWasherSelected ? selectedWasherIcon : washerIcon} alt="washer" />
          Washer
          <img
            alt="checkbox"
            className="checkbox-icon"
            src={isWasherSelected ? selectedRadio : unSelectedRadio}
          />
        </div>
        <div
          onClick={() => onChange("DRYER")}
          className={cx("type-selector", isDryerSelected && "active")}
        >
          <img src={isDryerSelected ? selectedDryerIcon : dryerIcon} alt="dryer" />
          Dryer
          <img
            alt="checkbox"
            className="checkbox-icon"
            src={isDryerSelected ? selectedRadio : unSelectedRadio}
          />
        </div>
      </div>
    </WizardStep>
  );
};

MachineTypeStep.propTypes = {
  machine: PropTypes.object.isRequired,
  setMachine: PropTypes.func.isRequired,
};

export default MachineTypeStep;
