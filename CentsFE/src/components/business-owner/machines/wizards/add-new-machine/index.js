import React, {useCallback, useEffect, useState} from "react";
import useTrackEvent from "../../../../../hooks/useTrackEvent";
import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../../../../constants/intercom-events";

import {ADD_NEW_MACHINE_STEPS, MACHINE_TYPES} from "../../constants";
import {addNewMachine} from "../../../../../api/business-owner/machines";

import LocationSelection from "./location-selection";
import MachineTypeStep from "../common/machine-type-step";
import MachineModelSelectionStep from "../common/machine-model-selection-step";
import MachinePricingStep from "../common/machine-pricing-step";
import MachineNumberStep from "../common/machine-number-step";

const AddNewMachine = (props) => {
  const {
    locations,
    dispatch,
    currentMachineTabType,
    onLocationSelect,
    onMachineAdd,
  } = props;

  const [machine, setMachine] = useState({type: currentMachineTabType});
  const [currentStep, setCurrentStep] = useState(
    Number(locations?.selected?.length || 0) > 1
      ? ADD_NEW_MACHINE_STEPS.LOCATION_SELECTION
      : ADD_NEW_MACHINE_STEPS.MACHINE_TYPE
  );
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState();

  const {trackEvent} = useTrackEvent();

  const trackButtonStepEvent = (wizardStep, cancel = false) => {
    const buttonName = cancel ? "Cancel" : "Next";

    trackEvent(
      INTERCOM_EVENTS.machineWizard,
      INTERCOM_EVENTS_TEMPLATES.machineWizard.wizardStepButton,
      {
        "Button name": buttonName,
        "Wizard step": wizardStep,
      }
    );
  };

  const addMachine = async () => {
    try {
      setAdding(true);
      setAddError();
      const payload = {
        storeId: machine?.storeId,
        modelId: machine?.model?.id,
        name: machine?.name,
      };
      if (machine?.type === MACHINE_TYPES.washer) {
        payload.pricePerTurnInCents = machine?.pricePerTurnInCents;
      } else {
        payload.turnTimeInMinutes = machine?.turnTimeInMinutes;
      }
      const res = await addNewMachine(payload);
      if (res?.data?.success) {
        setAdding(false);
        dispatch({type: "CLOSE_WIZARD"});
        onMachineAdd(machine);
      } else {
        setAddError("Something went wrong while creating a machine");
        setAdding(false);
      }
    } catch (e) {
      setAddError(e?.response?.data?.error || e?.message);
      setAdding(false);
    }
  };

  const handleSetMachine = useCallback(
    (machineType) => {
      trackEvent(
        INTERCOM_EVENTS.machineWizard,
        INTERCOM_EVENTS_TEMPLATES.machineWizard.washerDryer
      );
      setMachine(machineType);
    },
    [trackEvent]
  );

  useEffect(() => {
    if (Number(locations.selected?.length || 0) !== 1) {
      setCurrentStep(ADD_NEW_MACHINE_STEPS.LOCATION_SELECTION);
    } else {
      let locationChanged;
      setMachine((state) => {
        locationChanged = state.storeId !== locations.selected?.[0];
        return {...state, storeId: locations.selected?.[0]};
      });
      if (locationChanged) {
        setCurrentStep(ADD_NEW_MACHINE_STEPS.MACHINE_TYPE);
      }
    }
  }, [locations.selected]);

  switch (currentStep) {
    case ADD_NEW_MACHINE_STEPS.LOCATION_SELECTION:
      return (
        <LocationSelection
          totalSteps={4}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          machine={machine}
          setMachine={setMachine}
          locations={locations}
          onCancel={() => {
            trackButtonStepEvent("First", true);
            dispatch({type: "CLOSE_WIZARD"});
          }}
          onSubmit={() => {
            trackButtonStepEvent("First");
            onLocationSelect(machine?.storeId);
          }}
        />
      );
    case ADD_NEW_MACHINE_STEPS.MACHINE_TYPE:
      return (
        <MachineTypeStep
          totalSteps={4}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          machine={machine}
          setMachine={handleSetMachine}
          onCancel={() => {
            trackButtonStepEvent("Second", true);
            dispatch({type: "CLOSE_WIZARD"});
          }}
          onSubmit={() => {
            trackButtonStepEvent("Second");
            setCurrentStep(ADD_NEW_MACHINE_STEPS.MODEL_TYPE);
          }}
        />
      );
    case ADD_NEW_MACHINE_STEPS.MODEL_TYPE:
      return (
        <MachineModelSelectionStep
          totalSteps={4}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          machine={machine}
          setMachine={setMachine}
          onCancel={() => {
            trackButtonStepEvent("Third", true);
            dispatch({type: "CLOSE_WIZARD"});
          }}
          onSubmit={() => {
            trackButtonStepEvent("Third");
            setCurrentStep(ADD_NEW_MACHINE_STEPS.PRICING);
          }}
        />
      );
    case ADD_NEW_MACHINE_STEPS.PRICING:
      return (
        <MachinePricingStep
          totalSteps={4}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          machine={machine}
          setMachine={setMachine}
          onCancel={() => {
            trackButtonStepEvent("Fourth", true);
            dispatch({type: "CLOSE_WIZARD"});
          }}
          onSubmit={() => {
            trackButtonStepEvent("Fourth");
            setCurrentStep(ADD_NEW_MACHINE_STEPS.MACHINE_NAME);
          }}
        />
      );
    case ADD_NEW_MACHINE_STEPS.MACHINE_NAME:
      return (
        <MachineNumberStep
          totalSteps={4}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          machine={machine}
          setMachine={setMachine}
          isLoading={adding}
          errorMessage={addError}
          onCancel={() => {
            trackButtonStepEvent("Fifth", true);
            dispatch({type: "CLOSE_WIZARD"});
          }}
          onSubmit={() => {
            trackButtonStepEvent("Fifth");
            addMachine();
          }}
        />
      );
    default:
      return (
        <div className="machines-wizard-step-container">
          <div className="flex-centered">This step is not accounted for.</div>
        </div>
      );
  }
};

export default AddNewMachine;
