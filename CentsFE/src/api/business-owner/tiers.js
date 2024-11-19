import httpClient from "./../httpClient";

export const fetchTiersList = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/tiers",
    params,
  });
};

export const fetchDefaultServicesAndPrices = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/services/serviceprices",
    params,
  });
};

export const createTier = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/tiers/create",
    data,
  });
};

export const fetchTierPrices = (tierId) => {
  return httpClient({
    method: "GET",
    url: `business-owner/admin/tiers/${tierId}/services-products`,
  });
};

export const getTierDetails = (tierId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/tiers/${tierId}`,
  });
};

export const editTierDetails = (data, tierId) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/tiers/${tierId}`,
    data,
  });
};

export const editTierServicePrice = (data) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/tiers/service-price`,
    data,
  });
};

export const editTierProductPrice = (data) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/tiers/product-price`,
    data,
  });
};

export const validateTierName = (data) => {
  return httpClient({
    method: "POST",
    url: "business-owner/admin/tiers/validation",
    data,
  });
};

export const editTierOnlineOrderServices = (data, tierId) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/tiers/${tierId}/deliverable-services`,
    data,
  });
};
