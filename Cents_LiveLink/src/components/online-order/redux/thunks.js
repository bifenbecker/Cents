import {createAsyncThunk} from "@reduxjs/toolkit";
import {
  fetchCustomerInfo,
  saveAddressInfo,
  deleteCustomerAddress,
  fetchInitialOrderData,
  getServiceTypeAvailability,
  fetchReturnWindows,
  getAvailableNearStores,
} from "api/online-order";
import {fetchSubscriptions} from "api/subscriptions";
import {
  ONLINE_ORDER_REDUCER,
  GET_CUSTOMER_INFO,
  SAVE_ADDRESS_INFO,
  GET_ORDER_INITIAL_DATA,
  DELETE_CUSTOMER_ADDRESS,
  GET_CUSTOMER_SUBSCRIPTIONS_LIST,
  GET_SERVICE_TYPE_AVAILABILITY,
  GET_RETURN_WINDOWS,
  GET_NEAR_STORES,
} from "./constants/general";

export const getCustomerInfo = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_CUSTOMER_INFO}`,
  async (storeId) => {
    const response = await fetchCustomerInfo(storeId);
    return response.data.customer;
  }
);

export const patchAddressInfo = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${SAVE_ADDRESS_INFO}`,
  async (sendData) => {
    const {googlePlacesId, data} = sendData;
    const response = await saveAddressInfo(googlePlacesId, data);
    return response.data.centsCustomerAddress;
  }
);

export const deleteCustomerAddressInfo = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${DELETE_CUSTOMER_ADDRESS}`,
  async (sendData) => {
    // const {id: addressId} = sendData;
    const response = await deleteCustomerAddress(sendData);
    return response.data;
  }
);

export const getOrderInitialData = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_ORDER_INITIAL_DATA}`,
  async ({businessId, storeId}) => {
    const response = await fetchInitialOrderData(businessId, storeId);
    return response.data;
  }
);

export const getCustomerSubscriptionsList = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_CUSTOMER_SUBSCRIPTIONS_LIST}`,
  async () => {
    const response = await fetchSubscriptions();
    return response.data.subscriptions;
  }
);

export const getServiceTypesAvailability = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_SERVICE_TYPE_AVAILABILITY}`,
  async (storeId) => {
    const response = await getServiceTypeAvailability(storeId);
    return response.data;
  }
);

export const getReturnWindows = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_RETURN_WINDOWS}`,
  async (params) => {
    const response = await fetchReturnWindows(params);
    return response.data;
  }
);

export const getNearStores = createAsyncThunk(
  `${ONLINE_ORDER_REDUCER}/${GET_NEAR_STORES}`,
  async (params) => {
    const {timeZone} = params;
    const {data} = await getAvailableNearStores(params);
    return {
      ...data,
      addressTimeZone: timeZone,
    };
  }
);
