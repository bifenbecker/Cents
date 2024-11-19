import {combineReducers} from "@reduxjs/toolkit";

import {selfServeReducer} from "features/order/self-serve/redux";
import {availableCreditReducer} from "features/payment/availableCredit/redux";
import {onlineOrderReducer} from "components/online-order/redux";
import {businessSettingsReducer} from "features/business/redux";

const rootReducer = combineReducers({
  selfServe: selfServeReducer,
  availableCredit: availableCreditReducer,
  businessSettings: businessSettingsReducer,
  onlineOrder: onlineOrderReducer,
});
export default rootReducer;
