import React, { useMemo, useState } from "react";

import {
  displayErrorMessages,
  validateFormFactory,
} from "../utils/validations";
import { resetPasswordSchema } from "./location-steps.schema";

import PasswordForm from "../common/password-form";
import WizardFooter from "./wizard-footer";
import WizardHeader from "./wizard-header";

const passwordsValidator = validateFormFactory(resetPasswordSchema);

const LocationPasswordScreen = (props) => {
  const {
    location,
    setLocationField,
    addLocationStep,
    moveToStep,
    errorMessage,
    closeScreen,
    onSubmit,
  } = props;

  const [errorFields, setErrorFields] = useState({
    password: "",
    confirmPassword: "",
  });

  const isSaveDisabled = useMemo(() => {
    const { password, confirmPassword } = location;
    return [password, confirmPassword].includes("");
  }, [location]);

  const fieldErrors = useMemo(() => displayErrorMessages(errorFields), [
    errorFields,
  ]);

  const onSave = async () => {
    const isValid = await passwordsValidator(location, setErrorFields);
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <>
      <WizardHeader
        addLocationStep={addLocationStep}
        moveToStep={moveToStep}
        title="Tablet App Login Setup"
      />
      <div className="locations-card-content">
        <div className="location-form-screen-content">
          <div className="location-form-container centered password-container">
            <p>
              Location Name: <b>{location.name}</b>
            </p>
            <PasswordForm
              onInputChange={setLocationField}
              errorFields={errorFields}
              fields={location}
            />
          </div>
        </div>
      </div>
      <WizardFooter
        addLocationStep={addLocationStep}
        errorMessage={errorMessage || fieldErrors}
        closeScreen={closeScreen}
        isSaveDisabled={isSaveDisabled}
        onSave={onSave}
      />
    </>
  );
};

export default LocationPasswordScreen;
