import httpClient from "./httpClient";

export const getUberAuthenticationToken = () => {
  return httpClient({
    method: "POST",
    url: "/live-status/uber/authenticate",
  });
};

export const getOwnDriverDeliveryFee = params => {
  return httpClient({
    method: "GET",
    url: "/delivery/estimate",
    params,
  });
};

export const getDeliveryEstimate = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/uber/delivery/estimate",
    data,
  });
};

export const createUberDelivery = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/uber/delivery/create",
    data,
  });
};

export const getUberDeliveryDetails = orderDeliveryId => {
  return httpClient({
    method: "GET",
    url: `/live-status/uber/delivery/${orderDeliveryId}`,
  });
};

export const createOwnNetworkReturnDelivery = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/delivery/return/own",
    data,
  });
};

export const cancelUberDelivery = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/delivery/uber/cancel",
    data,
  });
};
