import httpClient from "./httpClient";

export const getUberAuthenticationToken = () => {
  return httpClient({
    method: "POST",
    url: "/live-status/uber/authenticate",
  });
};

// TODO: Might have to change this API.
export const getDeliveryEstimate = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/uber/delivery/estimate",
    data,
  });
};
