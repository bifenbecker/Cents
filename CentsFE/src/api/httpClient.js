import axios from "axios";
import {BASE_URL} from "../utils/config";
import {getParsedLocalStorageData} from "../utils/functions";
import {SESSION_ENV_KEY} from "../utils/config";
import {GUEST_ROUTES} from "../constants/routes";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = {
      authtoken: getParsedLocalStorageData(SESSION_ENV_KEY)?.token,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem(SESSION_ENV_KEY);
      if (!Object.values(GUEST_ROUTES).includes(window.location.pathname))
        window.location.href = window.location.origin;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
