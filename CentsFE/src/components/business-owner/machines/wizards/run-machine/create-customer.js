import React, {useState} from "react";
import * as yup from "yup";

import emailIcon from "../../../../../assets/images/email.svg";
import phoneIcon from "../../../../../assets/images/phone.svg";
import personIcon from "../../../../../assets/images/person.svg";
import closeIcon from "../../../../../assets/images/close.svg";

import TextField from "../../../../commons/textField/textField.js";
import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import {createCustomer} from "../../../../../api/business-owner/customers";

const CreateCustomer = (props) => {
  const {moveToStep, onCustomerAdd, storeId, searchedCustomer} = props;
  const [customerDetails, setCustomerDetails] = useState({
    firstName: !(/\d/.test(searchedCustomer)) ? searchedCustomer : "",
    lastName: "",
    email: "",
    phoneNumber: (/\d/.test(searchedCustomer)) ? searchedCustomer : "",
  });
  const [customerErrors, setCustomerErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addCustomerError, setAddCustomerError] = useState();

  const customerValidationSchema = yup.object().shape({
    firstName: yup.string().required("First Name is a required field"),
    lastName: yup.string().required("Last Name is a required field"),
    email: yup.string().email("Invalid email").required("Email is required field"),
    phoneNumber: yup
      .string()
      .required("Phone number is a required field")
      .max(16, "Invalid phone number"),
  });

  const isNewCustomerValid = (data) => {
    try {
      customerValidationSchema.validateSync(data);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleNewCustomerData = (key, value) => {
    try {
      customerValidationSchema.validateSyncAt(key, {[key]: value});
      // Reset Validation Error for current field
      setCustomerErrors((state) => ({
        ...state,
        [key]: "",
      }));
    } catch (e) {
      // Add Validation Error
      setCustomerErrors((state) => ({
        ...state,
        [key]: e.message,
      }));
    }
    setCustomerDetails((state) => ({
      ...state,
      [key]: value,
    }));
  };

  const onSave = async () => {
    if (isNewCustomerValid(customerDetails)) {
      try {
        setAddCustomerError();
        setAddingCustomer(true);
        const resp = await createCustomer({...customerDetails, storeId});
        if (resp?.data?.success) {
          const newCustomerData = resp?.data?.details;
          const newCustomerObj = {
            value: newCustomerData?.id,
            label: `${newCustomerData.fullName} \xa0 \xa0 \xa0 \xa0 ${newCustomerData.phoneNumber}`,
          };
          onCustomerAdd(newCustomerObj);
        }
      } catch (e) {
        setAddCustomerError(e?.response?.data?.error || e?.message);
      } finally {
        setAddingCustomer(false);
      }
    }
  };

  return (
    <div className="machines-wizard-step-container">
      {addingCustomer ? <BlockingLoader /> : null}
      <div className="machine-wizard-header create-customer-header">
        <img
          src={closeIcon}
          alt="exit"
          className="close-icon"
          onClick={() => {
            moveToStep(2);
          }}
        />
      </div>
      <div className="wizard-step-section middle-section create-customer-wizard">
        <p className="header">Add New Customer</p>
        <div className="wizard-text-fields-container">
          <div className="icon-text-container">
            <img src={personIcon} alt="icon"></img>
            <div className="fields-column-group">
              <TextField
                type="text"
                label="First Name"
                className="margin-bottom"
                onChange={(e) => {
                  handleNewCustomerData(
                    "firstName",
                    e.target.value.replace(/\s+/g, " ").trimStart()
                  );
                }}
                value={customerDetails?.firstName}
                error={customerErrors?.firstName}
              />
              <TextField
                type="text"
                label="Last Name"
                onChange={(e) => {
                  handleNewCustomerData(
                    "lastName",
                    e.target.value.replace(/\s+/g, " ").trimStart()
                  );
                }}
                value={customerDetails?.lastName}
                error={customerErrors?.lastName}
              />
            </div>
          </div>
          <div className="icon-text-container">
            <img src={emailIcon} alt="icon"></img>
            <TextField
              type="text"
              label="Email"
              onChange={(e) => {
                handleNewCustomerData("email", e.target.value);
              }}
              value={customerDetails?.email}
              error={customerErrors?.email}
            />
          </div>
          <div className="icon-text-container">
            <img src={phoneIcon} alt="icon"></img>
            <TextField
              type="text"
              label="Phone"
              onChange={(e) => {
                handleNewCustomerData(
                  "phoneNumber",
                  e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
                );
              }}
              value={customerDetails?.phoneNumber}
              error={customerErrors?.phoneNumber}
            />
          </div>
        </div>
      </div>
      <div className="machine-wizard-footer buttons-position">
        {addCustomerError ? <p className="error-message">{addCustomerError}</p> : null}
        <div className="btn-container">
          <button
            className="btn btn-text cancel-button"
            onClick={() => {
              moveToStep(2);
            }}
          >
            Cancel
          </button>
          <button
            className="btn-theme btn-rounded save-button"
            disabled={!isNewCustomerValid(customerDetails)}
            onClick={() => {
              onSave();
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomer;
