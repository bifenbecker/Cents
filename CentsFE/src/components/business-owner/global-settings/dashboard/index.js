import React, {Fragment, Suspense, lazy, useEffect, useState} from "react";
import {Switch, Route, Redirect} from "react-router-dom";
import {withLDConsumer} from "launchdarkly-react-client-sdk";
import BoHeader from "../../../../containers/bo-header";
import PageNotFound from "../../../page-not-found";
import HeaderNavigationButton from "../../../commons/header-navigation-button/header-navigation-button";
import navButtonAdminActiveIcon from "../../../../assets/images/Icon_Admin_Active.svg";
import navButtonAdminInActiveIcon from "../../../../assets/images/Icon_Admin_Inactive.svg";
import navButtonLaundromatsInActiveIcon from "../../../../assets/images/Icon_Laundromats_Inactive.svg";
import navButtonLaundromatsActiveIcon from "../../../../assets/images/Icon_Laundromats_Active.svg";
import BlockingLoader from "../../../commons/blocking-loader/blocking-loader";
import Store from "../../../../store";
import {getParsedLocalStorageData} from "../../../../utils/functions";
import {SESSION_ENV_KEY} from "../../../../utils/config";

const Account = lazy(() => import("../account/account"));
const Locations = lazy(() => import("../../../../containers/bo-locations"));
const Devices = lazy(() => import("../../../../containers/bo-devices"));
const Teams = lazy(() => import("../../../../containers/bo-teams"));
const ProductsAndServices = lazy(() =>
  import("../productsandservices/products-services")
);
const TaskManager = lazy(() => import("../../../../containers/bo-task-manager"));
const Promotions = lazy(() => import("../../../../containers/bo-promotions"));
const DoubleNav = lazy(() => import("../../../../containers/bo-doublenav"));

const BusinessOwnerDashboard = (props) => {
  const doubleNavState = Store.getState().businessOwner.globalSettings.doublenav;
  const [rightNavOpen, setRightNavOpen] = useState(doubleNavState.rightNav);

  useEffect(() => {
    setRightNavOpen(Store.getState().businessOwner.globalSettings.doublenav.rightNav);
  }, [rightNavOpen]);

  /**
   * Register the user in LD once authenticated.
   *
   * TODO in future: add this to routing hooks so that on initialization of app,
   * once authenticated and available, no matter what the entry route is,
   * you are properly verified
   *
   * @param {Object} localStorageData
   */
  const registerLaunchDarklyUser = (localStorageData) => {
    const user = {
      key: localStorageData?.email,
      email: localStorageData?.email,
      custom: {
        businessId: localStorageData?.businessId,
      },
    };
    return props?.ldClient?.identify(user, null, (data) => {
      return data;
    });
  };

  useEffect(() => {
    const localStorageData = getParsedLocalStorageData(SESSION_ENV_KEY);
    registerLaunchDarklyUser(localStorageData);
  }, [registerLaunchDarklyUser]);

  const _render_header = () => {
    let leftItems = [
      <HeaderNavigationButton
        key="admin-head-button"
        title="Admin"
        activeImage={navButtonAdminActiveIcon}
        inactiveImage={navButtonAdminInActiveIcon}
        isActive={true} // Hardcoding as this component is itself global-settings
      />,
      <HeaderNavigationButton
        key="laundromat-head-button"
        title="Laundromats"
        activeImage={navButtonLaundromatsActiveIcon}
        inactiveImage={navButtonLaundromatsInActiveIcon}
        linkTo="/"
        isActive={false} // Hardcoding as this can never be true in this component
      />,
    ];

    return <BoHeader leftItems={leftItems} />;
  };
  return (
    <Fragment>
      {_render_header()}
      <div
        className={
          rightNavOpen
            ? "global-settings-container-doublenav"
            : "global-settings-container-singlenav"
        }
      >
        <div className="left-section">
          <DoubleNav rightNavOpen={setRightNavOpen} />
        </div>
        <div className="right-section">
          <div className="content">
            <Suspense fallback={<BlockingLoader />}>
              <Switch>
                <Route
                  path={`${props.match.path}/`}
                  render={() => <Redirect to={`${props.match.path}/account`} />}
                  exact
                />
                <Route path={`${props.match.path}/account`} component={Account} />
                <Route path={`${props.match.path}/locations`} component={Locations} />
                <Route path={`${props.match.path}/devices`} component={Devices} />
                <Route
                  path={`${props.match.path}/task-manager`}
                  component={TaskManager}
                />
                <Route path={`${props.match.path}/teams`} component={Teams} />
                <Route
                  path={`${props.match.path}/products-services`}
                  component={ProductsAndServices}
                />
                <Route path={`${props.match.path}/promotions`} component={Promotions} />
                <Route component={PageNotFound} />
              </Switch>
            </Suspense>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default withLDConsumer()(BusinessOwnerDashboard);
