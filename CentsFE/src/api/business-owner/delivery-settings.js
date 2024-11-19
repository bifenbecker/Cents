import httpClient from "./../httpClient";

export const fetchDeliverySettings = (locationId, params) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/locations/${locationId}/delivery-settings`,
    params,
  });
};

export const updateDeliverySettings = (storeId, updatedSettings) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/${storeId}/delivery-settings`,
    data: updatedSettings,
  });
};

export const validateZipCode = (data) => {
  return httpClient({
    method: "PUT",
    url: "business-owner/admin/locations/validate-zipcode",
    data,
  });
};

export const deleteZone = (storeId, zoneId) => {
  return httpClient({
    method: "DELETE",
    url: `business-owner/admin/locations/${storeId}/zones/${zoneId}`,
  });
};

// Creates own driver delivery settings for a location.
export const createOwnDriverDeliverySettings = (storeId, settings) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/admin/locations/${storeId}/own-delivery-settings`,
    data: settings,
  });
};
// Updates zip codes, delivery and pickup fee and active status of own driver delivery toggle.
export const updateOwnDriverDeliverySettings = (storeId, settings) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/${storeId}/own-delivery-settings`,
    data: settings,
  });
};

export const createOnDemandDeliverySettings = (storeId, settings) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/admin/locations/${storeId}/cents-delivery-settings`,
    data: settings,
  });
};

// Updates returnOnlySubsidyFeeInCents,subsidyInCents,active of on demand delivery settings
export const updateOnDemandDeliverySettings = (storeId, settings) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/locations/${storeId}/cents-delivery-settings`,
    data: settings,
  });
};

export const validatZipcodesRemoval = (storeId, data) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/admin/locations/${storeId}/validate-remove-zipcodes`,
    data,
  });
};
