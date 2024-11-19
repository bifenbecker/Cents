import {BUSINESS_OWNER_AUTH_TOKEN_KEY} from "../utils/config";
const getToken = () => {
  const url = window.location;
  const access_token = new URLSearchParams(url.search).get("access_token");
  sessionStorage.setItem(BUSINESS_OWNER_AUTH_TOKEN_KEY, access_token);
};

export default getToken;
