import React, {memo} from "react";
import PropTypes from "prop-types";

import TextField from "../commons/textField/textField";
import logo from "../../assets/images/cents-logo.png";

const ForgotPassword = ({
  email,
  error,
  submissionSuccessful,
  onChange,
  onSubmitForgotRequest,
}) => {
  return (
    <div className="layout-main password-reset-main-layout common-background">
      <div className="password-reset-container forgot-password-container">
        <img src={logo} alt={"cents"} />
        {submissionSuccessful ? (
          <>
            <h3>Message Sent</h3>
            <p className="info-message">
              A email is sent to <span>{email}</span> with instructions to resetting your
              password
            </p>
          </>
        ) : (
          <>
            <h3>Forgot Password</h3>
            <p className="info-message">
              Please enter your registered email id with Cents. We will send you a link to
              reset password
            </p>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
              }}
            >
              <TextField
                label="Email Address"
                name="email"
                className="reset-password-field text-field-big"
                type="email"
                value={email}
                onChange={onChange}
              />
              <span className="error-message">{error}</span>
              <button
                onClick={() => onSubmitForgotRequest(email)}
                className="btn-theme btn-corner-rounded"
              >
                Submit
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

ForgotPassword.propTypes = {
  email: PropTypes.string,
  error: PropTypes.string,
  submissionSuccessful: PropTypes.bool,
  onChange: PropTypes.func,
  onSubmitForgotRequest: PropTypes.func,
};

export default memo(ForgotPassword);
