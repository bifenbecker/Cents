import httpClient from "./../httpClient";

export const fetchOrders = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/orders",
    params,
  });
};

export const downloadReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/orders/getOrdersReport",
    params,
  });
};

export const downloadSalesDetailsReport = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/orders/getSalesReport",
    params,
  });
};

export const fetchInsights = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/orders/insights",
    params,
  });
};

export const fetchOrderDetails = (orderId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/orders/${orderId}`,
  });
};

export const fetchInventoryOrderDetails = (orderId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/orders/inventory/${orderId}`,
  });
};

export const getOrderLiveLink = (orderId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/orders/${orderId}/live-link`,
  });
};

export const cancelOrder = (orderId) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/orders/${orderId}/cancel`,
  });
};

export const fetchPreferencesChoices = (businessId, customerId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/orders/business/${businessId}/preference-choices?customerId=${customerId}`,
  });
};
