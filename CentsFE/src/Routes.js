import React, {lazy, Suspense, useState, useEffect, useCallback} from "react";
import PropTypes from "prop-types";
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import {useFlags} from "launchdarkly-react-client-sdk";

import PageNotFound from "./components/page-not-found";
import BlockingLoader from "./components/commons/blocking-loader/blocking-loader.js";

import {ROLES} from "./constants";
import {SESSION_ENV_KEY} from "./utils/config";
import {getIntercomBootData, getParsedLocalStorageData} from "./utils/functions";
import {GUEST_ROUTES} from "./constants/routes";
import BoRouteAuthorization from "./hocs/BoRouteAuthorization";
import {useIntercom} from "react-use-intercom";
import {getAccountInfo} from "./api/business-owner/account";

// Lazy loads
const AdminDashboard = lazy(() => import("./containers/admin-dashboard.js"));
const BODashboard = lazy(() => import("./containers/bo-dashboard"));
const BOGlobalSettings = lazy(() => import("./containers/bo-gs-dashboard"));
const PasswordReset = lazy(() => import("./containers/password-reset"));
const Login = lazy(() => import("./containers/login.js"));
const ForgotPassword = lazy(() => import("./containers/forgot-password.js"));

const Spinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: `100%`,
      }}
    >
      <span>Loading</span>
    </div>
  );
};

const Routes = ({session, onSetSession}) => {
  const [isMounted, setIsMounted] = useState(false);
  const {boot} = useIntercom();
  const flags = useFlags();
  const {isLoggedIn, roleName} = session;

  const bootIntercom = useCallback(
    async (session) => {
      if (!session.uuid) {
        //uuid might not be set in local storage if user hasn't done login for a long time, in this case request user info from server to get uuid for Intercom

        try {
          const {
            data: {email, uuid, firstName, lastName},
          } = await getAccountInfo();

          boot(getIntercomBootData(email, uuid, firstName, lastName));
          onSetSession({...session, email, firstName, lastName, uuid});
        } catch (error) {
          console.log(error);
        }
      } else {
        boot(
          getIntercomBootData(
            session.email,
            session.uuid,
            session.firstName,
            session.lastName
          )
        );
      }
    },
    [onSetSession, boot]
  );

  useEffect(() => {
    setIsMounted(true);

    const {
      token,
      userId,
      teamMemberId,
      roleName,
      firstName,
      lastName,
      email,
      business,
      uuid,
    } = getParsedLocalStorageData(SESSION_ENV_KEY);
    const session = {
      isLoggedIn: !!token,
    };

    if (session.isLoggedIn) {
      session.token = token;
      session.userId = userId;
      session.teamMemberId = teamMemberId;
      session.roleName = roleName;
      session.firstName = firstName;
      session.lastName = lastName;
      session.email = email;
      session.business = business;
      session.uuid = uuid;

      onSetSession(session);

      if (flags?.intercomDevelopment) {
        bootIntercom(session);
      }
    } else {
      onSetSession(session);
    }
  }, [onSetSession, flags, bootIntercom]);

  return (
    <>
      <Router>
        {isMounted ? (
          <>
            {isLoggedIn ? (
              roleName === ROLES.superAdmin ? (
                <AdminRoutes />
              ) : (
                <BusinessOwnerRoutes />
              )
            ) : (
              <GuestRoutes />
            )}
          </>
        ) : (
          <Spinner />
        )}
      </Router>
    </>
  );
};

Routes.propTypes = {
  session: PropTypes.object,
  onSetSession: PropTypes.func,
  flags: PropTypes.object,
};

const AdminRoutes = () => {
  return (
    <Suspense fallback={<BlockingLoader />}>
      <Switch>
        <Route path="/" component={AdminDashboard} exact />
        <Route path="/device/:businessOwnerId" component={AdminDashboard} exact />
        <Route
          path="/login"
          render={() => {
            return <Redirect to="/" />;
          }}
          exact
        />
        <Route path="*" component={PageNotFound} exact />
      </Switch>
    </Suspense>
  );
};

const BusinessOwnerRoutes = () => {
  return (
    <Suspense fallback={<BlockingLoader />}>
      <Switch>
        <Route
          path="/dashboard"
          component={BoRouteAuthorization(
            [ROLES.owner, ROLES.admin, ROLES.manager],
            BODashboard
          )}
        />
        <Route
          path="/global-settings"
          component={BoRouteAuthorization([ROLES.owner, ROLES.admin], BOGlobalSettings)}
        />
        <Route path="/password-reset" component={PasswordReset} exact />
        <Route
          path="/login"
          render={() => {
            return <Redirect to="/" />;
          }}
          exact
        />
        <Route path="/" render={() => <Redirect to="/dashboard" />} exact />
        <Route path="*" component={PageNotFound} exact />
      </Switch>
    </Suspense>
  );
};

const GuestRoutes = () => {
  return (
    <Suspense fallback={<BlockingLoader />}>
      <Switch>
        <Route path={GUEST_ROUTES.login} component={Login} exact />
        <Route path={GUEST_ROUTES.resetPassword} component={PasswordReset} exact />
        <Route path={GUEST_ROUTES.forgotPassword} component={ForgotPassword} exact />

        <Route
          path={GUEST_ROUTES.default}
          render={() => {
            return <Redirect to={GUEST_ROUTES.login} />;
          }}
        />
        <Route path="*" component={PageNotFound} exact />
      </Switch>
    </Suspense>
  );
};

export default Routes;
