import httpClient from "./../httpClient";

export const fetchTaxRates = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/taxes",
    params,
  });
};

export const addNewTaxRate = (newTaxrate) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/taxes",
    data: newTaxrate,
  });
};

export const updateLocationTaxRate = ({id}, data) => {
  return httpClient({
    method: "PATCH",
    url: `/business-owner/admin/locations/${id}/tax-info`,
    data,
  });
};

export const updateTax = (taxId, data) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/admin/taxes/${taxId}`,
    data,
  });
};
