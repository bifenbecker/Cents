import {combineReducers} from "redux";
import locations from "./locations";
import accountSettings from "./accountSettings";
import devices from "./devices";
import taskManager from "./taskManager";
import teams from "./teams";
import services from "./services";
import products from "./products";
import promotions from "./promotions";
import doublenav from "./doublenav";
import preferences from "./preferences.js";
import drycleaning from "./drycleaning";
import categories from "./categories";
import oldServices from "./oldServices";

export default combineReducers({
  locations,
  devices,
  accountSettings,
  taskManager,
  teams,
  services,
  products,
  promotions,
  doublenav,
  preferences,
  drycleaning,
  categories,
  oldServices,
});
