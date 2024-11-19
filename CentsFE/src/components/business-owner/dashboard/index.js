import React, {Component, Fragment, lazy, Suspense} from "react";
import BoHeader from "../../../containers/bo-header";
import BoSidebar from "../bo-sidebar/bo-sidebar";
import {Switch, Route, Redirect, Link} from "react-router-dom";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

import locationIcon from "../../../assets/images/location.svg";
import customersWhiteIcon from "../../../assets/images/customer_tab_active.svg";
import customersGreyIcon from "../../../assets/images/customer_tab_inactive.svg";
import machinesWhiteIcon from "../../../assets/images/machine_white.svg";
import machinesGreyIcon from "../../../assets/images/machine_white_unselected.svg";
import ordersWhiteIcon from "../../../assets/images/Icon_Orders_Left_Navigation_Selected.svg";
import ordersGrayIcon from "../../../assets/images/Icon_Orders_Left_Navigation_Unselected.svg";
import SidebarItem from "../bo-sidebar-item/bo-sidebar-item";
import HeaderNavigationButton from "../../commons/header-navigation-button/header-navigation-button";
import navButtonAdminActiveIcon from "../../../assets/images/Icon_Admin_Active.svg";
import navButtonAdminInActiveIcon from "../../../assets/images/Icon_Admin_Inactive.svg";
import navButtonLaundromatsInActiveIcon from "../../../assets/images/Icon_Laundromats_Inactive.svg";
import navButtonLaundromatsActiveIcon from "../../../assets/images/Icon_Laundromats_Active.svg";
import LocationAssignDropdown from "../../commons/location-assign-dropdown/location-assign-dropdown";
import BlockingLoader from "../../commons/blocking-loader/blocking-loader";
import ReportsActiveIcon from "../../../assets/images/Reports_Active.png";
import ReportsInactiveIcon from "../../../assets/images/Reports_Inactive.png";

import {ROLES} from "../../../constants";
import {getParsedLocalStorageData} from "../../../utils/functions";
import {hasStoresInRegions} from "../../../utils/businessOwnerUtils";
import {SESSION_ENV_KEY} from "../../../utils/config";

// Pages
const Machines = lazy(() =>
  import("../../../components/business-owner/machines/machines")
);
const Customers = lazy(() => import("../../../containers/bo-customers"));
const Orders = lazy(() => import("../../../containers/bo-orders"));
const Reports = lazy(() => import("../../../containers/bo-reports"));

class BusinessOwnerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleName: null,
    };
  }

  componentDidMount() {
    this.props.fetchLocations();
    let localStorageData = getParsedLocalStorageData(SESSION_ENV_KEY);
    this.setState({
      roleName: localStorageData?.roleName,
    });
    this.registerLaunchDarklyUser(localStorageData);
  }

  /**
   * Register the user in LD once authenticated.
   *
   * TODO in future: add this to routing hooks so that on initialization of app,
   * once authenticated and available, no matter what the entry route is,
   * you are properly verified
   *
   * @param {Object} localStorageData
   */
  registerLaunchDarklyUser(localStorageData) {
    const user = {
      key: localStorageData?.email,
      email: localStorageData?.email,
      custom: {
        businessId: localStorageData?.businessId,
      },
    };
    return this.props?.ldClient?.identify(user, null, (data) => {
      return data;
    });
  }

  componentWillUnmount() {
    this.props.resetDashboard();
  }

  _renderLocationsDropdown() {
    return (
      <div className="locations-dropdown-container" key="location-select-dropdown">
        <LocationAssignDropdown
          allLocations={this.props?.dashboard?.allLocations}
          selectedLocations={this.props?.dashboard?.selectedLocations}
          needsRegions={this.props?.dashboard?.allLocations?.needsRegions}
          totalLocations={this.props?.dashboard?.totalLocations}
          onChange={(e) => {
            this.props.handleLocationsChange(e);
          }}
          withDetails={true}
        />
      </div>
    );
  }

  render() {
    const currentPath = this.props.location.pathname;
    const {allLocations} = this.props.dashboard;
    return (
      <Fragment>
        <BoHeader
          leftItems={[
            ...[
              this.state.roleName !== ROLES.manager ? (
                <HeaderNavigationButton
                  key="admin-head-button"
                  title="Admin"
                  activeImage={navButtonAdminActiveIcon}
                  inactiveImage={navButtonAdminInActiveIcon}
                  linkTo="/global-settings"
                  isActive={false} // Hardcoding as this component is itseld global-settings
                />
              ) : null,
            ],
            <HeaderNavigationButton
              key="laundromat-head-button"
              title="Laundromats"
              activeImage={navButtonLaundromatsActiveIcon}
              inactiveImage={navButtonLaundromatsInActiveIcon}
              isActive={true} // Hardcoding as this can never be true in this component
            />,
          ]}
          middleItems={[this._renderLocationsDropdown()]}
        />
        <BoSidebar>
          <SidebarItem
            linkToPath="/dashboard/orders"
            label="Orders"
            activeImg={ordersWhiteIcon}
            inactiveImg={ordersGrayIcon}
            currentPath={currentPath}
          />
          <SidebarItem
            linkToPath="/dashboard/customers"
            label="Customers"
            activeImg={customersWhiteIcon}
            inactiveImg={customersGreyIcon}
            currentPath={currentPath}
          />
          <SidebarItem
            linkToPath="/dashboard/machines"
            label="Machines"
            activeImg={machinesWhiteIcon}
            inactiveImg={machinesGreyIcon}
            currentPath={currentPath}
          />
          <SidebarItem
            linkToPath="/dashboard/reports"
            label="Reports"
            activeImg={ReportsActiveIcon}
            inactiveImg={ReportsInactiveIcon}
            currentPath={currentPath}
          />
        </BoSidebar>
        <div className="bo-dashboard-content-container">
          {this.props.dashboard.locationCallInProgress ? (
            <BlockingLoader />
          ) : allLocations?.locations?.length === 0 ? (
            <div className="dashboard-full-page-error-container">
              {this.state.roleName === ROLES.manager ? (
                <p>
                  There are no locations assigned to you. Please contact an admin or the
                  business owner.
                </p>
              ) : this.state.roleName === ROLES.admin &&
                (hasStoresInRegions(allLocations.regions) ||
                  allLocations.storesWithoutRegions.length) ? (
                <p>
                  There are no locations assigned to you. Please contact your business
                  owner or assign locations{" "}
                  <Link to={"/global-settings/locations"}>here</Link>.
                </p>
              ) : (
                <>
                  <p>No Locations are setup yet</p>
                  <p>Click the below button to start adding locations</p>
                  <img src={locationIcon} alt="location"></img>
                  <Link to={"/global-settings/locations"}>
                    <button className={"btn-theme btn-corner-rounded"}>
                      Add new location
                    </button>
                  </Link>
                </>
              )}
            </div>
          ) : this.props.dashboard.selectedLocations?.length === 0 ? (
            <div className="dashboard-full-page-error-container">
              <p>Please select at least one location in the above filter</p>
            </div>
          ) : (
            <Suspense fallback={<BlockingLoader />}>
              <Switch>
                <Route path="/dashboard/machines" component={Machines} exact />
                <Route path="/dashboard/customers" component={Customers} exact />
                <Route path="/dashboard/orders" component={Orders} exact />
                <Route path="/dashboard/reports" component={Reports} exact />
                <Route path="/" render={() => <Redirect to="/dashboard/orders" />} />
              </Switch>
            </Suspense>
          )}
        </div>
      </Fragment>
    );
  }
}

export default withLDConsumer()(BusinessOwnerDashboard);
