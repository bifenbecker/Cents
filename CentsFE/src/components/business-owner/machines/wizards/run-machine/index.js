import React, {useState} from "react";

import {RUN_MACHINE_STEPS, SERVICE_TYPES} from "../../constants";
import {startMachine} from "../../../../../api/business-owner/machines";

import DetailsStep from "./details-step";
import WashTypeStep from "./wash-type-step";
import CreateCustomer from "./create-customer";

const RunMachine = (props) => {
  const {selectedMachine, onRunMachineSuccess, dispatch} = props;

  const [runMachineData, setRunMachineData] = useState({
    quantity: 1,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState();
  const [searchedCustomer, setsearchedCustomer] = useState("");
  const runMachine = async () => {
    try {
      setRunning(true);
      setRunError();
      let payload = {...runMachineData};
      if (runMachineData?.serviceType === SERVICE_TYPES.customerService) {
        delete payload.customer;
        payload = {
          ...payload,
          centsCustomerId: runMachineData?.customer?.value,
        };
      }
      const res = await startMachine(selectedMachine?.id, payload);
      if (res?.data?.success) {
        setRunning(false);
        onRunMachineSuccess(selectedMachine?.id);
        dispatch({type: "CLOSE_WIZARD"});
      } else {
        setRunError("Something went wrong while running a machine");
        setRunning(false);
      }
    } catch (e) {
      setRunError(e?.response?.data?.error || e?.message);
      setRunning(false);
    }
  };

  switch (currentStep) {
    case RUN_MACHINE_STEPS.WASH_TYPE:
      return (
        <WashTypeStep
          totalSteps={2}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          runMachineData={runMachineData}
          setRunMachineData={setRunMachineData}
          selectedMachine={selectedMachine}
          onCancel={() => dispatch({type: "CLOSE_WIZARD"})}
          onSubmit={() => {
            setCurrentStep(RUN_MACHINE_STEPS.DETAILS);
          }}
        />
      );
    case RUN_MACHINE_STEPS.DETAILS:
      return (
        <DetailsStep
          totalSteps={2}
          currentStep={currentStep}
          moveToStep={setCurrentStep}
          runMachineData={runMachineData}
          searchedCustomer={setsearchedCustomer}
          setRunMachineData={setRunMachineData}
          isLoading={running}
          selectedMachine={selectedMachine}
          customerSearchResults={customerSearchResults}
          setCustomerSearchResults={setCustomerSearchResults}
          errorMessage={runError}
          onCancel={() => dispatch({type: "CLOSE_WIZARD"})}
          onSubmit={runMachine}
        />
      );
    case RUN_MACHINE_STEPS.CREATE_CUSTOMER:
      return (
        <CreateCustomer
          moveToStep={setCurrentStep}
          storeId={selectedMachine?.store?.id}
          searchedCustomer={searchedCustomer}
          onCustomerAdd={(newCustomerObj) => {
            setRunMachineData((state) => ({
              ...state,
              customer: newCustomerObj,
            }));
            setCustomerSearchResults((state) => [newCustomerObj, ...state]);
            setCurrentStep(2);
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

export default RunMachine;
