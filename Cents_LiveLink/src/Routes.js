import React, {Fragment, useEffect} from "react";
import {BrowserRouter as Router, Switch, Route, useLocation} from "react-router-dom";
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";
import {useFlags} from "launchdarkly-react-client-sdk";

import {PrivateRoute} from "./hoc";
import {RECAPTCHA_KEY} from "./utils/config";

import SelfServeWrapper from "features/order/self-serve/components/wrapper/SelfServeWrapper";
import {
  Landing,
  OrderSummary,
  PageNotFound,
  VerifyAccount,
  OnlineOrder,
  MySubscriptions,
} from "./components";

const RoutesListing = () => {
  const location = useLocation();
  const flags = useFlags();

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {};
  }, [location]);

  return (
    <Switch>
      <PrivateRoute path="/order-summary/:orderToken" exact component={OrderSummary} />
      <Route path="/verify-account" exact component={VerifyAccount} />
      <PrivateRoute path="/" exact component={Landing} />
      <Route path="/order" component={OnlineOrder} />
      {flags?.selfServeOrdering && (
        <Route path="/self-serve/:uniqueCode" exact component={SelfServeWrapper} />
      )}
      <PrivateRoute path="/subscriptions" exact component={MySubscriptions} />
      <Route path="*" component={PageNotFound} />
    </Switch>
  );
};

const Routes = () => {
  return (
    <Fragment>
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_KEY}
        scriptProps={{
          async: true,
        }}
      >
        <Router>
          <RoutesListing />
        </Router>
      </GoogleReCaptchaProvider>
    </Fragment>
  );
};

export default Routes;
