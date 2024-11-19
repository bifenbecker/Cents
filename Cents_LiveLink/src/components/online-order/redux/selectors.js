import {createSelector} from "reselect";

const getOnlineOrderData = (state) => state.onlineOrder;
export const getBusinessTheme = createSelector(
  getOnlineOrderData,
  (state) => state.initialOrderData.data.theme
);
export const getDeliveryProviders = createSelector(
  getOnlineOrderData,
  (state) => state.deliveryProviders
);
export const getSubscriptions = createSelector(
  getOnlineOrderData,
  (state) => state.initialOrderData.data.subscriptions
);
export const getAddressTimeZone = createSelector(
  getOnlineOrderData,
  (state) => state.nearStoresData.data.addressTimeZone
);
export const getCustomerInfo = createSelector(
  getOnlineOrderData,
  (state) => state.customerInfo
);
export const getLatestAddress = createSelector(
  getOnlineOrderData,
  (state) => state.initialOrderData.data.customerAddress
);
export const getOrderInitialData = createSelector(
  getOnlineOrderData,
  (state) => state.initialOrderData
);
export const getNearStoresData = createSelector(
  getOnlineOrderData,
  (state) => state.nearStoresData
);
export const getNewOrderConfig = createSelector(
  getOnlineOrderData,
  (state) => state.newOrderConfig
);
export const getCurrentView = createSelector(
  getOnlineOrderData,
  (state) => state.schedule.currentStage
);

export const getServiceTypeAvailability = createSelector(
  getOnlineOrderData,
  (state) => state.serviceTypeAvailability
);

export const getScheduleDetails = createSelector(
  getOnlineOrderData,
  (state) => state.schedule
);

export const getReturnWindowsState = createSelector(
  getOnlineOrderData,
  (state) => state.returnWindows
);

export const getStoreId = createSelector(
  getOnlineOrderData,
  (state) =>
    state.nearStoresData.data.onDemandDeliveryStore?.storeId ||
    state.nearStoresData.data.ownDeliveryStore?.storeId
);

export const getBusinessID = createSelector(
  getOnlineOrderData,
  (state) => state.initialOrderData.data.businessId
);

export const getCurrentCustomerAddress = createSelector(
  getOnlineOrderData,
  (state) => state.currentCustomerAddress
);

export const onlineOrderSelectors = {
  getOnlineOrderData,
  getBusinessTheme,
  getDeliveryProviders,
  getSubscriptions,
  getAddressTimeZone,
  getCustomerInfo,
  getLatestAddress,
  getOrderInitialData,
  getNearStoresData,
  getNewOrderConfig,
  getCurrentView,
  getServiceTypeAvailability,
  getScheduleDetails,
  getReturnWindowsState,
  getStoreId,
  getBusinessID,
  getCurrentCustomerAddress,
};
