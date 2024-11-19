import qs from "query-string";
import customerState, {initialCustomerState} from "../state/customer";

import {
  CUSTOMER_AUTH_TOKEN_KEY,
  CUSTOMER_KEY,
  BUSINESS_OWNER_AUTH_TOKEN_KEY,
} from "./config";

export const getQueryString = (search) => {
  return qs.parse(search?.split("?")[1]);
};

export const convertToQueryString = qs.stringify;

export const logoutCustomer = () => {
  localStorage.removeItem(CUSTOMER_AUTH_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
  sessionStorage.removeItem(BUSINESS_OWNER_AUTH_TOKEN_KEY);
  customerState.set(initialCustomerState);
};

export const getDeliveryAcknowledgementKey = (orderId) => {
  return `liveLink:${orderId}-scheduledDeliveryAcknowledged`;
};

export const getDeliveryAfterProcessingAcknowledgementKey = (orderId) => {
  return `liveLink:${orderId}-scheduledDeliveryAfterProcessingAcknowledged`;
};

export const getSkipRecurringPickupAcknowledgementKey = (orderId) => {
  return `liveLink:${orderId}-skipRecurringPickupAcknowledged`;
};

export const setStringifiedLocalStorageData = (itemName, item) => {
  try {
    localStorage.setItem(itemName, JSON.stringify(item));
  } catch (error) {
    console.log(error);
  }
};

export const getParsedLocalStorageData = (itemName) => {
  try {
    return JSON.parse(localStorage.getItem(itemName)) || {};
  } catch (error) {
    return {};
  }
};

export const WEEKS = {
  WEEKLY: "Weekly",
  EVERY_2_WEEK: "Every 2 weeks",
  EVERY_3_WEEK: "Every 3 weeks",
  EVERY_4_WEEK: "Every 4 weeks",
};
