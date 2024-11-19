import React from "react";
import {Redirect} from "react-router-dom";
import {SESSION_ENV_KEY} from "../utils/config";
import {getParsedLocalStorageData} from "../utils/functions";

const BoRouteAuthorization = (roles, Component, options = {}) => {
  const {fallback = "/dashboard"} = options;
  const currentRole = getParsedLocalStorageData(SESSION_ENV_KEY)?.roleName;

  const WrappedComponent = (props) => {
    return roles.includes(currentRole) ? (
      <Component {...props} />
    ) : (
      <Redirect to={fallback} />
    );
  };
  return WrappedComponent;
};

export default BoRouteAuthorization;
