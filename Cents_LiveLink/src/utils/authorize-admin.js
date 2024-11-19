import {authorizeAsAdmin} from "../api/auth";
import {onlineOrderState} from "../state/online-order";
import {BUSINESS_OWNER_AUTH_TOKEN_KEY} from "./config";

const handleAuthorizationAsAdmin = async businessId => {
  try {
    let token = sessionStorage.getItem(BUSINESS_OWNER_AUTH_TOKEN_KEY);
    if (token && token !== "null" && businessId) {
      const res = await authorizeAsAdmin({token, businessId});
      onlineOrderState.merge({
        isAuthorized: res.data.success,
      });
    } else {
      onlineOrderState.merge({
        isAuthorized: false,
      });
    }
  } catch (error) {
    console.log("the error: ", error);
    onlineOrderState.merge({
      isAuthorized: false,
    });
  }
};

export default handleAuthorizationAsAdmin;
