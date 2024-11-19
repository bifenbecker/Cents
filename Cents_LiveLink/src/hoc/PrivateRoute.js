import React from "react";
import {Route, Redirect, useLocation} from "react-router-dom";
import useCustomerState from "../hooks/useCustomerState";

import {getQueryString} from "../utils/common";

const PrivateRoute = ({component: Component, ...rest}) => {
  const {customerAuthToken} = useCustomerState();
  const location = useLocation();

  /* Checking auth token to see if the user is logged in. */
  return (
    <Route
      {...rest}
      render={props => {
        /*
          Check if the orderToken is there in the params so that we can redirect
          to that order summary page after login.
        */
        let {orderToken} = props.match.params;
        if (!orderToken) {
          orderToken = getQueryString(props.location.search)?.orderToken;
        }
        const destination = orderToken
          ? `/order-summary/${orderToken}`
          : location.pathname;

        const search = orderToken ? `?orderToken=${orderToken}` : location.search;

        return customerAuthToken ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/verify-account",
              search: `${search}&destination=${encodeURIComponent(destination)}`,
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
