import React, {useMemo, useState} from "react";

import hashIcon from "../../../../../assets/images/hash.svg";
import percentageIcon from "../../../../../assets/images/Icon_Tax_Percentage.svg";
import {buildTaxRateOptions, findSelectedTaxRate} from "../utils/tax-rate";
import {displayErrorMessages, validateFormFactory} from "../utils/validations";
import {businessDetailsSchema} from "./location-steps.schema";

import TextField from "../../../../commons/textField/textField";
import MaterialSelect from "../../../../commons/select/select";
import WizardHeader from "./wizard-header";
import WizardFooter from "./wizard-footer";

const businessDetailsValidator = validateFormFactory(businessDetailsSchema);

const LocationBusinessDetails = (props) => {
  const {
    addLocationStep,
    location,
    setLocationField,
    taxRatesList,
    addNewTaxRate,
    errorMessage,
    closeScreen,
    onSubmit,
    moveToStep,
  } = props;

  const [errorFields, setErrorFields] = useState({
    taxRate: "",
    dcaLicense: "",
  });

  const taxRatesOptions = useMemo(() => buildTaxRateOptions(taxRatesList), [
    taxRatesList,
  ]);

  const selectedTaxRateOption = useMemo(() => {
    return findSelectedTaxRate(taxRatesOptions, location.taxRate);
  }, [location.taxRate, taxRatesOptions]);

  const fieldErrors = useMemo(() => displayErrorMessages(errorFields), [errorFields]);

  const onSave = async () => {
    const isValid = await businessDetailsValidator(location, setErrorFields);
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <>
      <WizardHeader
        addLocationStep={addLocationStep}
        moveToStep={moveToStep}
        title="Business Details"
      />
      <div className="locations-card-content">
        <div className="location-form-screen-content">
          <div className="location-form-container">
            <div className="input-container">
              <img src={hashIcon} alt="locations" />
              <TextField
                label="DCA Number - Retail"
                className="account-settings-input location-form-input"
                value={location.dcaLicense}
                onChange={(evt) => setLocationField("dcaLicense", evt)}
                error={errorFields.dcaLicense}
                maxLength={15}
              />
            </div>
            <div className="input-container">
              <img src={hashIcon} alt="locations" />
              <TextField
                label="DCA Number - Commercial"
                className="account-settings-input location-form-input"
                value={location.commercialDcaLicense}
                onChange={(evt) => setLocationField("commercialDcaLicense", evt)}
                error={errorFields.dcaLicense}
                maxLength={15}
              />
            </div>
            <div className="input-container">
              <img src={percentageIcon} alt="percentage" />
              <MaterialSelect
                className="locations-tax-rate-dropdown"
                label="Tax Rate"
                value={selectedTaxRateOption}
                options={taxRatesOptions}
                maxMenuHeight={175}
                menuShouldScrollIntoView
                error={errorFields.taxRate}
                onChange={(selectedOption) => {
                  if (selectedOption.value === "new-tax-rate") {
                    addNewTaxRate();
                  } else {
                    setLocationField("taxRate", selectedOption);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <WizardFooter
        addLocationStep={addLocationStep}
        errorMessage={errorMessage || fieldErrors}
        closeScreen={closeScreen}
        onSave={onSave}
      />
    </>
  );
};

export default LocationBusinessDetails;
