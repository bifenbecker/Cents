import httpClient from "./httpClient";

export const fetchStoreTheme = storeId => {
  return httpClient({
    method: "GET",
    url: `/live-status/store-theme/${storeId}`,
  });
};
