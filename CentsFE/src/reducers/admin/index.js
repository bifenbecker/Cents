import { combineReducers } from "redux";
import businessOwners from "./businessOwners";
import devices from "./devices";

export default combineReducers({
  businessOwners,
  devices
});
