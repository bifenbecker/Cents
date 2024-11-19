import React, {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";

import resetPasswordSchema from "./reset-password.validation";
import {displayErrorMessages, validateFormFactory} from "../utils/validations";

import BlockingLoader from "../../../../commons/blocking-loader/blocking-loader";
import exitIcon from "../../../../../assets/images/Icon_Exit_Side_Panel.svg";
import PasswordForm from "../common/password-form";

const initState = {
  password: "",
  confirmPassword: "",
};

const resetPasswordValidator = validateFormFactory(resetPasswordSchema);

const ResetPassword = ({
  location,
  showPasswordForm,
  onResetPassword,
  resetPasswordApiError,
  resetPasswordLoading,
  isLocationDetailsLoading,
  onUnmountResetPassword,
  onSetShowResetPasswordScreen,
  onSetShowPasswordForm,
}) => {
  const {id, address} = location;

  const [resetPasswordFields, setResetPasswordFields] = useState({
    ...initState,
  });

  const [resetPasswordErrors, setResetPasswordErrors] = useState({
    ...initState,
  });

  const setPasswordField = (field, evt) => {
    const value = evt.target.value;

    setResetPasswordFields((state) => ({
      ...state,
      [field]: value.trim(),
    }));
  };

  const validateForm = async () =>
    await resetPasswordValidator(resetPasswordFields, setResetPasswordErrors);

  const isSaveDisabled = useMemo(() => {
    const {password, confirmPassword} = resetPasswordFields;

    return [password, confirmPassword].includes("");
  }, [resetPasswordFields]);

  const fieldErrors = useMemo(() => {
    return displayErrorMessages(resetPasswordErrors);
  }, [resetPasswordErrors]);

  useEffect(() => {
    return () => {
      // Unmount will just reset the resetPassword variables.
      // The API call to refresh active details WILL NOT HAPPEN.
      setResetPasswordFields({...initState});
      setResetPasswordErrors({...initState});
      onUnmountResetPassword();
    };
  }, [onUnmountResetPassword]);

  useEffect(() => {
    // Reset fields and validation error messages
    // after toggling the showPasswordForm
    setResetPasswordFields({...initState});
    setResetPasswordErrors({...initState});
  }, [showPasswordForm]);

  const handleResetPasswordSave = async () => {
    setResetPasswordErrors({
      password: "",
      confirmPassword: "",
    });

    const isValid = await validateForm();

    if (isValid) {
      await onResetPassword(location, resetPasswordFields);
    }
  };

  return (
    <>
      {showPasswordForm ? (
        <>
          <div className="locations-card-content reset-password-form-content">
            <div className="reset-password-form-container">
              <div className="reset-password-header">
                <p>Reset Password</p>
              </div>
              <div className="reset-password-body">
                <PasswordForm
                  onInputChange={setPasswordField}
                  errorFields={resetPasswordErrors}
                  fields={resetPasswordFields}
                />
              </div>
            </div>
          </div>
          <div className="locations-card-footer">
            <p className="reset-passsword-error-message">
              {resetPasswordApiError || fieldErrors}
            </p>
            <div className="btn-container">
              <button
                className="btn btn-text cancel-button"
                onClick={() => {
                  onSetShowPasswordForm(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-theme btn-rounded save-button"
                disabled={isSaveDisabled}
                onClick={handleResetPasswordSave}
              >
                Save
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="locations-card-content reset-password-content">
          <div className="reset-password-container">
            <div className="exit-icon-container">
              <img
                src={exitIcon}
                alt="exit"
                onClick={async () => {
                  // This WOULD REFRESH the active selected location details
                  onSetShowResetPasswordScreen(false);
                }}
              />
            </div>
            <div className="reset-password-header">
              <p className="address-subtitle">{address.toUpperCase()}</p>
              <p className="main-header">Location Tablet Login</p>
            </div>
            <div className="reset-password-body">
              <p>
                Location ID: <b>{id}</b>
              </p>
              <p
                className="reset-password-link text-btn"
                onClick={() => onSetShowPasswordForm(true)}
              >
                Reset Password &gt;
              </p>
            </div>
          </div>
        </div>
      )}
      {(isLocationDetailsLoading || resetPasswordLoading) && <BlockingLoader />}
    </>
  );
};

ResetPassword.propTypes = {
  location: PropTypes.object,
  showPasswordForm: PropTypes.bool,
  onResetPassword: PropTypes.func,
  resetPasswordApiError: PropTypes.string,
  resetPasswordLoading: PropTypes.bool,
  isLocationDetailsLoading: PropTypes.bool,
  onUnmountResetPassword: PropTypes.func,
  onSetShowResetPasswordScreen: PropTypes.func,
  onSetShowPasswordForm: PropTypes.func,
};

export default ResetPassword;
