import httpClient from "./../httpClient";

export const fetchAllServices = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/services/list",
    params,
  });
};

export const fetchServiceDetails = (serviceId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/services/${serviceId}`,
  });
};

export const fetchServiceCategoriesForService = (id) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/services/type/${id}/categories`,
  });
};

export const createOrUpdateService = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/services/save",
    data,
  });
};

export const createOrUpdateNewServiceSubcategory = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/services/category",
    data,
  });
};

export const getPricingStructure = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/services/pricing-structures",
  });
};

export const updatePerLocationServicePrices = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/services/save-service-prices",
    data,
  });
};

export const updateSingleServicePriceField = (data) => {
  return httpClient({
    method: "PUT",
    url: "/business-owner/admin/services/update-price",
    data,
  });
};

export const getServicesCategoryList = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/services/cat/list",
  });
};

export const fetchServiceCategories = (params = {}) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/services/categories",
    params,
  });
};

export const updateServiceDetails = (data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/services/${data.id}`,
    data,
  });
};

export const fetchModifiersList = (param) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/services/modifiers/${param}`,
  });
};

export const createNewModifier = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/modifiers",
    data,
  });
};

export const toggleModifierIsFeatured = ({isFeatured, serviceModifierId}) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/services/modifier/${serviceModifierId}`,
    data: {
      isFeatured,
    },
  });
};

export const updateExistingModifier = ({name, price, modifierId}) => {
  const data = {name, price};
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/modifiers/${modifierId}`,
    data,
  });
};

export const archieveService = (serviceId) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/services/archive/${serviceId}`,
  });
};

export const applyPriceToAllLocations = (serviceId, price, servicePriceIds) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/services/${serviceId}/prices`,
    data: {price, servicePriceIds},
  });
};
