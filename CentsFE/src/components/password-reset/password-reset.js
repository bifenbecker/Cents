import React, {useEffect, memo} from "react";
import PropTypes from "prop-types";
import {Redirect} from "react-router-dom";
import qs from "querystring";

import TextField from "../commons/textField/textField";
import logo from "../../assets/images/cents-logo.png";

const PasswordReset = ({
  location,
  passwordReset,
  onVerifyResetToken,
  onSetResetTokenStatus,
  onChange,
  onSubmit,
}) => {
  useEffect(() => {
    const queryString = location.search && location.search.replace("?", "");
    const {token} = qs.parse(queryString);

    if (!token) {
      // Set token as invalid
      onSetResetTokenStatus(false);
    } else {
      // Call verify token
      onVerifyResetToken(token);
    }
  }, [location.search, onSetResetTokenStatus, onVerifyResetToken]);

  if (passwordReset.resetSuccessful) {
    return <Redirect to="/" />;
  }

  return (
    <div className="layout-main password-reset-main-layout common-background">
      {passwordReset.isResetTokenValid === null ? (
        ""
      ) : passwordReset.isResetTokenValid ? (
        <div className="password-reset-container">
          <img src={logo} alt={"cents"} />
          <h3>Reset Password</h3>
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              onSubmit(
                passwordReset.newPassword,
                passwordReset.reEnterPassword,
                passwordReset.resetToken
              );
            }}
          >
            <TextField
              value={passwordReset.newPassword}
              label="New password"
              name="newPassword"
              className="reset-password-field text-field-big"
              type="password"
              onChange={onChange}
            />
            <TextField
              value={passwordReset.reEnterPassword}
              label="Re-enter password"
              name="reEnterPassword"
              className="reset-password-field text-field-big"
              type="password"
              onChange={onChange}
            />
            <p className="error-message">{passwordReset.errorMessage}</p>
            <button
              onClick={() =>
                onSubmit(
                  passwordReset.newPassword,
                  passwordReset.reEnterPassword,
                  passwordReset.resetToken
                )
              }
              className="btn-theme btn-corner-rounded"
            >
              Reset Password
            </button>
          </form>
        </div>
      ) : (
        "This link is invalid"
      )}
    </div>
  );
};

PasswordReset.propTypes = {
  location: PropTypes.object,
  passwordReset: PropTypes.object,
  onVerifyResetToken: PropTypes.func,
  onSetResetTokenStatus: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default memo(PasswordReset);
