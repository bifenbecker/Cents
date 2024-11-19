import {combineReducers} from "redux";
import globalSettings from "./globalSettings";
import dashboard from "./dashboard";
import machines from "./machines";
import customers from "./customers";
import orders from "./orders";

export default combineReducers({
  globalSettings,
  dashboard,
  machines,
  customers,
  orders,
});
