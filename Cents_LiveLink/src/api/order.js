import httpClient from "./httpClient";

export const fetchStoreSettings = params => {
  return httpClient({
    method: "GET",
    url: "/live-status/settings",
    params,
  });
};

export const authenticateOrder = token => {
  return httpClient({
    method: "GET",
    url: "/live-status/verify-order",
    params: {
      token,
    },
  });
};

export const fetchOrderDetail = token => {
  return httpClient({
    method: "GET",
    url: "/live-status",
    params: {
      token,
    },
  });
};

export const updateTip = (token, tipData) => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/tip",
    params: {
      token,
    },
    data: tipData,
  });
};

export const addPromo = (token, promoData) => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/add-promotion",
    params: {
      token,
    },
    data: promoData,
  });
};

export const removePromo = token => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/remove-promotion",
    params: {
      token,
    },
  });
};

export const addCredits = (token, creditsData) => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/add-credits",
    params: {
      token,
    },
    data: creditsData,
  });
};

export const removeCredits = token => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/remove-credits",
    params: {
      token,
    },
  });
};

export const setOnlineOrderReturnMethod = (token, data) => {
  return httpClient({
    method: "PUT",
    url: "/live-status/return-method",
    params: {
      token,
    },
    data,
  });
};

export const updatePaymentMethodIntent = (token, {paymentToken}) => {
  return httpClient({
    method: "PUT",
    url: "/live-status/payment-method",
    params: {
      token,
    },
    data: {paymentToken},
  });
};

export const cancelOrder = params => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/order/cancel",
    params,
  });
};

export const getRouteDelivery = (token, {orderDelivery}) => {
  return httpClient({
    method: "GET",
    url: `/live-status/order-delivery/${orderDelivery}/route-details`,
    params: {token},
  });
};

export const fetchOrderDeliveries = token => {
  return httpClient({
    method: "GET",
    url: `/live-status/order-deliveries`,
    params: {token},
  });
};

export const manageOrder = (token, data) => {
  return httpClient({
    method: "PUT",
    url: `/live-status/live-link/manage`,
    params: {token},
    data,
  });
};
