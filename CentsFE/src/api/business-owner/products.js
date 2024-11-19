import httpClient from "./../httpClient";

export const fetchProductsList = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/products/list",
    params,
  });
};

export const fetchProductCategories = () => {
  return httpClient({
    method: "GET",
    url: "business-owner/admin/products/categories/list",
  });
};

export const saveNewProduct = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/products/save",
    data,
  });
};

// export const updateProductDetails = (id, field, value) => {
//   return httpClient({
//     method: "PUT",
//     url: "/business-owner/admin/products/update",
//     data: {
//       id,
//       field,
//       value,
//     },
//   });
// };

export const saveNewCategory = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/products/categories/save",
    data,
  });
};

export const fetchProductDetails = (id) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/products/${id}`,
  });
};

export const updateProductPrices = (inventoryId, storeId, field, value) => {
  return httpClient({
    method: "PUT",
    url: "/business-owner/admin/products/prices/update",
    data: {
      inventoryId,
      storeId,
      field,
      value,
    },
  });
};

export const fetchFileStackKey = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/filestack",
  });
};

export const updateAllProductDetails = (data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/products/${data.id}`,
    data,
  });
};

export const applyProductPriceToLocations = (productId, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/products/${productId}/prices`,
    data,
  });
};

export const archiveProduct = (productId, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/products/archive/${productId}`,
    data,
  });
};
