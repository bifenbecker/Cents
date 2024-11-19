import React from "react";

import TextField from "../../../../commons/textField/textField";

const PasswordForm = (props) => {
  const { onInputChange, errorFields, fields, bigInput } = props;

  return (
    <>
      <div className="input-container">
        <TextField
          type="password"
          error={errorFields.password}
          label="New Password"
          className={`account-settings-input ${
            bigInput ? "text-field-big" : ""
          }`}
          value={fields.password}
          onChange={(evt) => onInputChange("password", evt)}
        />
      </div>
      <div className="input-container">
        <TextField
          type="password"
          error={errorFields.confirmPassword}
          label="Confirm Password"
          className={`account-settings-input ${
            bigInput ? "text-field-big" : ""
          }`}
          value={fields.confirmPassword}
          onChange={(evt) => onInputChange("confirmPassword", evt)}
        />
      </div>
      <div className="disclaimer">
        <b>*</b>
        <i>
          <p>
            Password must have at least one letter, one number and one special
            character.
          </p>
        </i>
      </div>
    </>
  );
};

export default PasswordForm;
