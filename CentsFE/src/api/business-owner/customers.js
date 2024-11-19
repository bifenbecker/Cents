import httpClient from "./../httpClient";

export const fetchCustomers = (stores, page, keyword) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/customers",
    params: {stores, page, keyword},
  });
};

export const fetchInsights = (stores) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/customers/insights",
    params: {stores},
  });
};

export const fetchCustomerDetails = (customerId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/customers/${customerId}`,
  });
};

export const fetchCustomerInsights = (customerId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/customers/insights/${customerId}`,
  });
};

export const fetchCustomerLanguages = () => {
  return httpClient({
    method: "GET",
    url: `/business-owner/customers/languages`,
  });
};

export const createCustomer = (data) => {
  return httpClient({
    method: "POST",
    url: "business-owner/customers",
    data,
  });
};

export const updateBoCustomer = (customerId, field, value) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/customers/${customerId}`,
    data: {
      userId: customerId,
      field,
      value,
    },
  });
};

export const issueCredit = (data) => {
  return httpClient({
    method: "POST",
    url: "business-owner/customers/issueCredit",
    data,
  });
};

export const fetchCreditReasons = () => {
  return httpClient({
    method: "GET",
    url: "business-owner/customers/reasons",
  });
};

export const searchCustomers = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/customers/search",
    params,
  });
};

export const searchCustomersInMachines = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/machine/customers/search",
    params,
  });
};

export const fetchStripeClientSecret = (customerId) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/customers/${customerId}/card-on-file/intent`,
  });
};

export const createCardOnFile = (customerId, token) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/customers/${customerId}/card-on-file`,
    data: {token},
  });
};

export const fetchCardsOnFile = (customerId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/customers/${customerId}/card-on-file`,
  });
};

export const removeCardOnFile = (customerId, paymentMethod) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/customers/${customerId}/card-on-file/detach`,
    data: {id: paymentMethod},
  });
};

export const exportCustomerList = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/customers/export",
    params,
  });
};

export const toggleCommercialCustomer = (customerId, isCommercial, commercialTierId) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/customers/${customerId}/toggle-commercial`,
    data: {isCommercial, commercialTierId},
  });
};

export const searchAndListPricingTiers = (params) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/admin/tiers`,
    params,
  });
};

export const fetchSubscriptions = (id, storeIds) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/customers/subscriptions`,
    params: {id, storeIds},
  });
};
