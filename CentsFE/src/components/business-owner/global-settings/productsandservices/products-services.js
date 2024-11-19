// @ts-nocheck
// Package imports
import React from "react";
import {Switch, Route, Redirect} from "react-router-dom";

// Local component imports
import LaundryServices from "../../../../containers/bo-services";
import LegacyLaundryServices from "../../../../containers/bo-old-services";
import Products from "../../../../containers/bo-products";
import DryCleaning from "../../../../containers/bo-drycleaning";
import Categories from "../../../../containers/bo-categories";
import PricingTiers from "../pricing-tiers";
import {useFlags} from "launchdarkly-react-client-sdk";

const ProductsAndServices = (props) => {
  const flags = useFlags();
  return (
    <>
      <Switch>
        <Route
          path={`${props.match.path}/`}
          render={() => <Redirect to={`${props.match.path}/laundry-services`} />}
          exact
        />
        {flags.cents20 ? (
          <Route
            path={`${props.match.path}/laundry-services`}
            component={LaundryServices}
          />
        ) : (
          <Route
            path={`${props.match.path}/laundry-services`}
            component={LegacyLaundryServices}
          />
        )}
        <Route path={`${props.match.path}/products`} component={Products} />
        <Route path={`${props.match.path}/tiers`} component={PricingTiers} />
        {flags.cents20 && (
          <Route path={`${props.match.path}/categories`} component={Categories} />
        )}
        {flags.cents20 && (
          <Route path={`${props.match.path}/dry-cleaning`} component={DryCleaning} />
        )}
        <Route>
          {
            <>
              <div className="not-found-container">
                <p className="oops">Oops!</p>
                <p className="four-o-four">404 - Page not found</p>
                <p className="not-found-message">
                  You might have reached here by mistake. Click on one of the above tabs
                  to navigate.
                </p>
              </div>
            </>
          }
        </Route>
      </Switch>
    </>
  );
};

export default ProductsAndServices;
