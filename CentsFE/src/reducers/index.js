import { combineReducers } from "redux";
import login from "./login";
import admin from "./admin";
import session from "./session";
import businessOwner from "./businessOwner";
import passwordReset from './password-reset';
import forgotPassword from './forgot-password';

export default combineReducers({
  login,
  passwordReset,
  forgotPassword,
  session,
  admin,
  businessOwner
});
