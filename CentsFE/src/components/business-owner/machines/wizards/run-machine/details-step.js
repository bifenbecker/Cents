import React, {useEffect, useState, useCallback, useRef} from "react";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {components} from "react-select";

import {SERVICE_TYPES, MACHINE_TYPES} from "../../constants";

import {
  searchCustomersInMachines,
  fetchCustomers,
} from "../../../../../api/business-owner/customers";
import {prepareCustomerOptions, getDryerTime} from "../../utils";

import personIcon from "../../../../../assets/images/person.svg";
import pencilIcon from "../../../../../assets/images/pencil.svg";

import WizardStep from "../../common/wizard-step";
import TextField from "../../../../commons/textField/textField.js";
import PlusMinusButtons from "../../../../commons/plus-minus-buttons/plusMinusButtons";
import TextArea from "../../../../commons/text-area/text-area";
import MaterialAsyncSelect from "../../../../commons/material-async-select/material-async-select";

const DetailsStep = (props) => {
  const {
    runMachineData,
    setRunMachineData,
    selectedMachine,
    customerSearchResults,
    setCustomerSearchResults,
    searchedCustomer,
    moveToStep,
    ...rest
  } = props;

  const [dryerQuantity, setDryerQuantity] = useState(runMachineData?.quantity || 1);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);

  const mounted = useRef();
  const onChange = (field, value) => {
    setRunMachineData((state) => ({
      ...state,
      [field]: value,
    }));
  };

  const loadCustSearchOptions = async (keyword) => {
    try {
      let searchResp = await searchCustomersInMachines({
        keyword,
        page: 1,
      });

      if (searchResp?.data?.success) {
        return prepareCustomerOptions(get(searchResp, "data.detail", []));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goToNextStep = (inputValue) => {
    searchedCustomer(inputValue);
    moveToStep(3);
  };

  // A Subcomponent of react select - Used this inorder to have the Add new button within menu list
  const MenuListComponent = (props) => {
    return (
      <components.MenuList {...props}>
        <div
          className="add-customer-dropdown-option"
          onClick={() => goToNextStep(props?.selectProps?.inputValue)}
        >
          {props?.selectProps?.inputValue ? "+ Add" : "+ Add New Customer"}{" "}
          <span className="customer-name">{props?.selectProps?.inputValue}</span>
        </div>
        {fetchingCustomers ? <div className="grey-text">Loading...</div> : props.children}
      </components.MenuList>
    );
  };

  const fetchCustomerList = useCallback(async () => {
    try {
      setFetchingCustomers(true);
      let resp = await fetchCustomers([selectedMachine.store?.id], 1);
      if (resp?.data?.success) {
        setCustomerSearchResults(get(resp, "data.detail", []));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingCustomers(false);
    }
  }, [selectedMachine.store, setCustomerSearchResults]);

  useEffect(() => {
    if (
      runMachineData.serviceType === SERVICE_TYPES.customerService &&
      !customerSearchResults.length &&
      !mounted.current
    ) {
      // Make API call && set default search list
      fetchCustomerList();
    }
    // Since it should be called only on component mount
  }, [customerSearchResults.length, fetchCustomerList, runMachineData.serviceType]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <WizardStep
      header={`${
        runMachineData?.serviceType === SERVICE_TYPES.technicalService
          ? "Technical"
          : "Customer Service"
      } ${
        selectedMachine?.model?.type === MACHINE_TYPES.washer ? "Wash" : "Dry"
      } Details `}
      isSaveDisabled={
        runMachineData?.serviceType === SERVICE_TYPES.technicalService
          ? !runMachineData?.note || !runMachineData?.technicianName
          : !runMachineData?.note || isEmpty(runMachineData?.customer)
      }
      buttonCta={"RUN MACHINE"}
      buttonStyle={{width: "170px"}}
      moveToStep={moveToStep}
      {...rest}
    >
      <div className="wizard-step-section middle-section">
        <div className="wizard-text-fields-container">
          <div className="icon-text-container">
            <img src={personIcon} alt="icon"></img>
            {runMachineData?.serviceType === SERVICE_TYPES.technicalService ? (
              <TextField
                type="text"
                label="Technician Name"
                maxLength={100}
                onChange={(e) => {
                  onChange(
                    "technicianName",
                    e.target.value.replace(/\s+/g, " ").trimLeft()
                  );
                }}
                value={runMachineData?.technicianName}
              />
            ) : (
              <MaterialAsyncSelect
                label="Customer Name"
                defaultOptions={prepareCustomerOptions(customerSearchResults)}
                loadOptions={loadCustSearchOptions}
                smallHeight
                maxMenuHeight={150}
                value={runMachineData?.customer}
                onChange={(option) => {
                  onChange("customer", option);
                }}
                className="cust-search-select"
                components={{MenuList: MenuListComponent}}
              />
            )}
          </div>
          <div className="icon-text-container">
            <img src={pencilIcon} alt="icon"></img>
            <TextArea
              label="Notes"
              onChange={(e) => {
                onChange("note", e.target.value.replace(/\s+/g, " ").trimLeft());
              }}
              value={runMachineData?.note}
              className="text-area"
            />
          </div>
          {/*  Implement increment timer for the dryers */}
          {selectedMachine?.model?.type === MACHINE_TYPES.dryer ? (
            <div className="dryer-time-container">
              <p>Add dryer time</p>
              <PlusMinusButtons
                displayTime={getDryerTime(
                  selectedMachine?.turnTimeInMinutes,
                  dryerQuantity
                )}
                disableMinus={dryerQuantity === 1}
                setValue={(value) => {
                  onChange("quantity", dryerQuantity + value);
                  setDryerQuantity(dryerQuantity + value);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </WizardStep>
  );
};

export default DetailsStep;
