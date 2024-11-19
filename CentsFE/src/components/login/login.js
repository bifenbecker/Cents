import React, {useEffect, useCallback, memo} from "react";
import PropTypes from "prop-types";
import {withLDConsumer} from "launchdarkly-react-client-sdk";
import useTrackEvent from "../../hooks/useTrackEvent";

import LoginForm from "./form";
import BlockingLoader from "../commons/blocking-loader/blocking-loader";
import * as authAPI from "../../api/authentication";

import {
  INTERCOM_EVENTS,
  INTERCOM_EVENTS_TEMPLATES,
} from "../../constants/intercom-events";
import {getIntercomBootData} from "../../utils/functions.js";

const Login = ({
  login,
  onResetFields,
  onSetApiError,
  onSetApiShowError,
  onSetEmailError,
  onSetEmailName,
  onSetEmailShowError,
  onSetLoginLoading,
  onSetPassword,
  onSetPasswordError,
  onSetPasswordShowError,
  onSetSession,
}) => {
  const {boot, trackEvent} = useTrackEvent();

  useEffect(() => {
    return () => {
      onSetApiError("");
      onSetApiShowError(false);
    };
  }, [onSetApiError, onSetApiShowError]);

  const validateEmail = useCallback(() => {
    const {email} = login;

    if (email.value.trim() === "") {
      onSetEmailShowError(true);
      onSetEmailError("Email cannot be empty");

      return false;
    } else {
      onSetEmailShowError(false);
      onSetEmailError("");

      return true;
    }
  }, [onSetEmailShowError, onSetEmailError, login]);

  const validatePassword = useCallback(() => {
    const {password} = login;

    if (password.value.trim() === "") {
      onSetPasswordShowError(true);
      onSetPasswordError("Password cannot be empty");

      return false;
    } else {
      onSetPasswordShowError(false);
      onSetPasswordError("");

      return true;
    }
  }, [onSetPasswordShowError, onSetPasswordError, login]);

  const isFormValid = useCallback(() => {
    return validateEmail() && validatePassword();
  }, [validateEmail, validatePassword]);

  const handleAuthentication = useCallback(async () => {
    const {email, password} = login;

    try {
      onSetLoginLoading(true);

      const {data} = await authAPI.login({
        username: email.value,
        password: password.value,
      });

      onSetLoginLoading(false);

      if (data.success === true) {
        const {
          user: {token, userId, teamMemberId, firstName, lastName, email, roleName, uuid},
          business,
        } = data;

        const session = {
          business,
          email,
          firstName,
          lastName,
          roleName,
          teamMemberId,
          token,
          userId,
          uuid,
          isLoggedIn: true,
          businessId: business.id,
        };

        onResetFields();
        onSetSession(session);

        boot(getIntercomBootData(email, uuid, firstName, lastName));
        trackEvent(INTERCOM_EVENTS.signIn, INTERCOM_EVENTS_TEMPLATES.signIn);
      }
    } catch (error) {
      onSetLoginLoading(false);

      if (error.response === undefined) {
        onSetApiError(error.message);
      } else {
        onSetApiError(error.response.data.error);
      }

      onSetApiShowError(true);
    }
  }, [
    login,
    onSetLoginLoading,
    onResetFields,
    onSetSession,
    boot,
    trackEvent,
    onSetApiShowError,
    onSetApiError,
  ]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (isFormValid()) {
        await handleAuthentication();
      } else {
        // clear API errors if any
        onSetApiError("");
        onSetApiShowError(false);
      }
    },
    [handleAuthentication, isFormValid, onSetApiError, onSetApiShowError]
  );

  const handleEmailChange = useCallback(
    ({target: {value}}) => {
      onSetEmailName(value);
    },
    [onSetEmailName]
  );

  const handlePasswordChange = useCallback(
    ({target: {value}}) => {
      onSetPassword(value);
    },
    [onSetPassword]
  );

  const {email, password, api} = login;

  return (
    <>
      <div className="landing-page-container layout-main d-flex common-background signin-page">
        {login.loading && <BlockingLoader />}
        {/* <div className="landing-page-left d-flex">
            <h1 className="title-project">Cents</h1>
          </div> */}
        <div className="signin-container flex-item-centered">
          <LoginForm
            api={api}
            email={email}
            password={password}
            handleLogin={handleLogin}
            handleEmailChange={handleEmailChange}
            handlePasswordChange={handlePasswordChange}
          />
        </div>
      </div>
    </>
  );
};

Login.propTypes = {
  login: PropTypes.object,
  onResetFields: PropTypes.func,
  onSetApiError: PropTypes.func,
  onSetApiShowError: PropTypes.func,
  onSetEmailError: PropTypes.func,
  onSetEmailName: PropTypes.func,
  onSetEmailShowError: PropTypes.func,
  onSetLoginLoading: PropTypes.func,
  onSetPassword: PropTypes.func,
  onSetPasswordError: PropTypes.func,
  onSetPasswordShowError: PropTypes.func,
  onSetSession: PropTypes.func,
};

export default withLDConsumer()(memo(Login));
