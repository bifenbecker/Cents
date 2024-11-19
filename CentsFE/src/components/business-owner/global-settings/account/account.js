// Package imports
import React from "react";
import {Switch, Route, Redirect} from "react-router-dom";

// Local component imports
import Card from "../../../commons/card/card";
import Details from "../../../../containers/bo-account-details";
import Regions from "../../../../containers/bo-account-regions";
import Settings from "../../../../containers/bo-account-settings";
import Taxes from "../../../../containers/bo-account-taxes";
import Payments from "../../../../containers/bo-account-payments";
import Preferences from "../../../../containers/bo-account-customer-preferences.js";

const Account = (props) => {
  return (
    <div className="account-main-container">
      <Card className={"account-card"}>
        <div className="card-main-container">
          <div className="header">
            <p className={"main-text"}>Account</p>
          </div>
          <div className="content">
            <div className="tabbed-content">
              <Switch>
                <Route
                  path={`${props.match.path}/`}
                  render={() => <Redirect to={`${props.match.path}/details`} />}
                  exact
                />
                <Route path={`${props.match.path}/details`} component={Details} />
                <Route path={`${props.match.path}/regions`} component={Regions} />
                <Route path={`${props.match.path}/taxes`} component={Taxes} />
                <Route path={`${props.match.path}/settings`} component={Settings} />
                <Route path={`${props.match.path}/payments`} component={Payments} />
                <Route path={`${props.match.path}/preferences`} component={Preferences} />
                <Route>
                  {
                    <>
                      <div className="not-found-container">
                        <p className="oops">Oops!</p>
                        <p className="four-o-four">404 - Page not found</p>
                        <p className="not-found-message">
                          You might have reached here by mistake. Click on one of the
                          above tabs to navigate.
                        </p>
                      </div>
                    </>
                  }
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Account;
