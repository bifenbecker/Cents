import httpClient from "./httpClient";

export const getAvailableNearStores = ({
  businessId,
  timeZone,
  zipCode,
  lat,
  lng,
  googlePlacesId,
}) => {
  return httpClient({
    method: "GET",
    url: "/live-status/near-stores",
    params: {businessId, timeZone, zipCode, lat, lng, googlePlacesId},
  });
};

export const fetchServicesAndModifiers = (storeId, zipCode) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/deliverable-services`,
    params: {zipCode},
  });
};

export const fetchFeaturedServices = (storeId, data) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/featured-services`,
    params: data,
  });
};

export const fetchCustomerLatestAddress = () => {
  return httpClient({
    method: "GET",
    url: "/live-status/customer/addresses/latest",
  });
};

export const saveAddressInfo = (placeId, data) => {
  return httpClient({
    method: "PUT",
    url: `/live-status/customer/address/${placeId}`,
    data,
  });
};

export const deleteCustomerAddress = (id) => {
  return httpClient({
    method: "DELETE",
    url: `/live-status/customer/address/${id}`,
  });
};

export const fetchCustomerInfo = (storeId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/customer/${storeId}/info`,
  });
};

export const fetchAvailableDeliverySettings = (storeId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/available-delivery-settings`,
  });
};

export const fetchGeneralDeliverySettings = (storeId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/general-delivery-settings`,
  });
};

export const fetchOwnDriverDeliverySettings = (storeId, params) => {
  return httpClient({
    method: "GET",
    params,
    url: `/live-status/stores/${storeId}/own-driver-delivery-settings`,
  });
};

export const fetchOnDemandDeliverySettings = (storeId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/on-demand-delivery-settings`,
  });
};

export const submitPickupOrder = (storeId, data) => {
  return httpClient({
    method: "POST",
    url: `/live-status/stores/${storeId}/order`,
    data,
  });
};

export const fetchOwnDriverDeliveryWindows = (storeId, params) => {
  return httpClient({
    method: "GET",
    params,
    url: `/live-status/stores/${storeId}/own-delivery-windows`,
  });
};

export const fetchPreferencesChoices = (businessId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/preferences-choices/${businessId}`,
  });
};

export const updateStoreCustomerPreference = (businessId, data) => {
  return httpClient({
    method: "PATCH",
    url: `/live-status/customer-store/${businessId}`,
    data,
  });
};

export const fetchPreferences = (businessId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/preference-choices/business/${businessId}`,
  });
};

export const updateCustomerOptionSelection = (selectionId, data) => {
  return httpClient({
    method: "PATCH",
    url: `/live-status/preference-choices/selections/${selectionId}`,
    data,
  });
};

export const createCustomerOptionSelection = (data) => {
  return httpClient({
    method: "POST",
    url: "/live-status/preference-choices/selections",
    data,
  });
};

export const deleteCustomerOptionSelection = (selectionId) => {
  return httpClient({
    method: "DELETE",
    url: `/live-status/preference-choices/selections/${selectionId}`,
  });
};

export const fetchTurnaroundTimesForCategories = (businessId) => {
  return httpClient({
    method: "GET",
    params: {businessId},
    url: "/live-status/categories/turnaround-time",
  });
};

export const getServiceTypeAvailability = (storeId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/stores/${storeId}/service-availability/get`,
  });
};

export const getBusinessByCustomUrl = (customUrl) => {
  return httpClient({
    method: "GET",
    url: `/live-status/business/custom/${customUrl}`,
  });
};

export const fetchInitialOrderData = (businessId, storeId) => {
  return httpClient({
    method: "GET",
    url: "/live-status/initial-order-data",
    params: {business: businessId, store: storeId},
  });
};

export const fetchReturnWindows = (params) => {
  return httpClient({
    method: "GET",
    url: "/live-status/return-windows",
    params,
  });
};
