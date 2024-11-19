import React from "react";
import {withLDConsumer} from "launchdarkly-react-client-sdk";

const FeatureToggle = ({flags, children}) => {
  return flags.advancedCustomerPreferences ? <>{children}</> : <></>;
};

export default withLDConsumer()(FeatureToggle);
