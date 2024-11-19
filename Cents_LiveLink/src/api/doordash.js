import httpClient from "./httpClient";

export const getDoorDashDeliveryEstimate = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/doordash/estimate",
    data,
  });
};

export const createDoorDashReturnDelivery = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/doordash/delivery/return/create",
    data,
  });
};

export const getDoorDashDeliveryDetails = orderDeliveryId => {
  return httpClient({
    method: "GET",
    url: `/live-status/doordash/delivery/${orderDeliveryId}`,
  });
};
