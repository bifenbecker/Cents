import httpClient from "./httpClient";

export const fetchBusinessTheme = (businessId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/business-theme/${businessId}`,
  });
};

export const fetchBusinessSettings = (businessId) => {
  return httpClient({
    method: "GET",
    url: `/live-status/business-settings/${businessId}`,
  });
};
