import axios from "axios";
import {BASE_URL, CUSTOMER_AUTH_TOKEN_KEY} from "../utils";
import {logoutCustomer} from "../utils/common";

const getCustomerAuthToken = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY));
  } catch (error) {
    console.log(error);
    return null;
  }
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // timeout: 30 * 1000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = {
      customerAuthToken: getCustomerAuthToken(),
      version: process.env.REACT_APP_VERSION,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => {
    // if res is 401 delete token
    return res;
  },
  (error) => {
    const res = error.response;
    if (res?.status === 401) {
      const {
        config: {
          params: {token},
        },
      } = res;

      setTimeout(() => {
        logoutCustomer(token);
        window.location.href = [
          "/verify-account",
          `?destination=${encodeURIComponent(window.location.pathname)}`,
          token ? `&orderToken=${token}` : "",
        ].join("");
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
