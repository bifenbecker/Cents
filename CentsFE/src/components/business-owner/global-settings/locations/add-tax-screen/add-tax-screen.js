import React, { useEffect, useMemo, useState } from "react";

import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import taxPercentageIcon from "../../../../../assets/images/Icon_Tax_Percentage.svg";

import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import TextField from "../../../../commons/textField/textField";

const AddTaxScreen = (props) => {
  const {
    submitNewTaxRate,
    taxErrorMessage,
    selectedLocation,
    newTaxRateCallInprogress,
    exitAddTaxRateScreen,
  } = props;

  useEffect(() => {
    return () => {
      exitAddTaxRateScreen();
    };
  }, [exitAddTaxRateScreen]);

  const [taxRate, setTaxRate] = useState({ name: "", rate: "", taxAgency: "" });

  const handleFormInput = (field, evt, validate) => {
    const newInput = validate
      ? evt.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
      : evt.target.value;
    setTaxRate((state) => ({
      ...state,
      [field]: newInput,
    }));
  };

  const isSaveDisabled = useMemo(() => {
    const { name, rate, taxAgency } = taxRate;
    return [name.trim(), rate, taxAgency.trim()].includes("");
  }, [taxRate]);

  return (
    <>
      <div className="locations-card-header without-border-bottom">
        <div className="close-icon">
          <img src={exitIcon} alt="exit" onClick={exitAddTaxRateScreen} />
        </div>
      </div>
      <div className="locations-card-content add-tax-content">
        <div className="add-taxrate-form">
          <div className="tax-rate-heading">Add New Tax Rate</div>
          <div className="text-field-with-icons">
            <img
              src={taxPercentageIcon}
              alt="percentage"
              style={{ marginRight: "10px" }}
            />
            <TextField
              label="Tax Rate Name"
              className="tax-rate-input"
              value={taxRate.name}
              onChange={(evt) => handleFormInput("name", evt)}
              maxLength={30}
            />
          </div>
          <div className="text-field-with-icons">
            <span className="spacer"></span>
            <TextField
              label="Tax Rate"
              className="tax-rate-input"
              suffix="%"
              value={taxRate.rate}
              onChange={(evt) => handleFormInput("rate", evt, true)}
              maxLength={5}
            />
          </div>
          <div className="text-field-with-icons">
            <span className="spacer"></span>
            <TextField
              label="Tax Agency"
              className="tax-rate-input"
              value={taxRate.taxAgency}
              onChange={(evt) => handleFormInput("taxAgency", evt)}
              maxLength={30}
            />
          </div>
          <p className="error-message">{taxErrorMessage}</p>
        </div>
        <div className="add-taxrate-ui-footer">
          <div className="cancel-text" onClick={exitAddTaxRateScreen}>
            Cancel
          </div>
          <button
            className="btn-theme btn-rounded save-button"
            disabled={isSaveDisabled}
            onClick={() => {
              submitNewTaxRate(taxRate, selectedLocation?.id);
            }}
          >
            SAVE
          </button>
        </div>
      </div>
      {newTaxRateCallInprogress && <BlockingLoader />}
    </>
  );
};

export default AddTaxScreen;
