import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import SidebarMenu from "../../../components/business-owner/bo-sidebar/bo-sidebar.js";
import Header from "../../../containers/bo-header";
import Customers from "../../../containers/admin-customers.js";
import Devices from "../../../containers/admin-devices.js";
import SidebarItem from "../../business-owner/bo-sidebar-item/bo-sidebar-item";
import customersWhiteIcon from "../../../assets/images/customer_tab_active.svg";
import customersGreyIcon from "../../../assets/images/customer_tab_inactive.svg";

class Dashboard extends Component {
  handleLogout = (e) => {
    e.preventDefault();
    this.props.removeSession();
  };

  render() {
    const currentPath = this.props.location.pathname;
    return (
      <React.Fragment>
        <div className="layout-main">
          <Header handleLogout={this.handleLogout} admin />
          <SidebarMenu>
            <SidebarItem
              linkToPath="/"
              label="Customers"
              activeImg={customersWhiteIcon}
              inactiveImg={customersGreyIcon}
              currentPath={currentPath}
            />
          </SidebarMenu>
          <div className="container-main">
            <Router>
              <Switch>
                <Route path="/" component={Customers} exact />
                <Route path="/device/:businessOwnerId" component={Devices} exact />
              </Switch>
            </Router>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Dashboard;
