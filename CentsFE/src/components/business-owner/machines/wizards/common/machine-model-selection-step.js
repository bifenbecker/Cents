import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import capitalize from "lodash/capitalize";
import lowerCase from "lodash/lowerCase";

import selectedWasherIcon from "../../../../../assets/images/Icon_Washer_Selected.svg";
import selectedDryerIcon from "../../../../../assets/images/Icon_Dryer_Selected_Large.svg";

import {MACHINE_TYPES} from "../../constants";
import {getMachineModels} from "../../../../../api/business-owner/machines";

import IconSelect from "../../../../commons/icon-select/IconSelect";
import WizardStep from "../../common/wizard-step";

const MachineModelSelectionStep = (props) => {
  const {machine, setMachine, ...rest} = props;
  const [machineModels, setMachineModels] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const fetchMachineModels = async (type) => {
    try {
      setLoading(true);
      const res = await getMachineModels({type});

      setMachineModels(res?.data?.machineModels);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineModels(machine.type);
  }, [machine.type]);

  const modelOptions = machineModels?.map((model) => ({
    label: `${model?.modelname} - ${model?.manufacturer}, ${model?.capacity}`,
    value: model?.id,
  }));

  const onModelChange = (model) => setMachine((state) => ({...state, model}));

  return (
    <WizardStep
      header={`${capitalize(machine?.type)} Type`}
      isLoading={loading}
      errorMessage={error}
      isSaveDisabled={loading || !machine?.model}
      {...rest}
    >
      <div className="description-with-input">
        <p>Which model is this {lowerCase(machine?.type)}?</p>
        <IconSelect
          smallHeight
          className="model-type-select"
          options={modelOptions}
          icon={
            machine?.type === MACHINE_TYPES.washer
              ? selectedWasherIcon
              : selectedDryerIcon
          }
          value={modelOptions?.find((item) => item?.value === machine?.model?.id)}
          onChange={(opt) =>
            onModelChange(machineModels?.find((item) => item?.id === opt.value))
          }
          placeholder="Select a model"
        />
      </div>
    </WizardStep>
  );
};

MachineModelSelectionStep.propTypes = {
  machine: PropTypes.object.isRequired,
  setMachine: PropTypes.func.isRequired,
};

export default MachineModelSelectionStep;
