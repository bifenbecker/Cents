import httpClient from "./httpClient";

export const createCustomer = ({fullName, phoneNumber}) => {
  return httpClient({
    method: "POST",
    url: "/live-status/customer",
    data: {fullName, phoneNumber},
  });
};

export const verifyCustomer = ({phoneNumber}) => {
  return httpClient({
    method: "GET",
    url: "/live-status/customer/verify",
    params: {phoneNumber},
  });
};

export const addCustomerAddress = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/customer/address/create",
    data,
  });
};

export const updateCustomerAddress = data => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/customer/address/update",
    data,
  });
};

export const updateCustomerPhoneNumber = data => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/customer/phone/update",
    data,
  });
};

export const saveDeliveryInstructions = data => {
  return httpClient({
    method: "PATCH",
    url: "/live-status/customer/address/instructions/update",
    data,
  });
};

export const getCustomerPaymentMethods = centsCustomerId => {
  return httpClient({
    method: "GET",
    url: `/live-status/customer/payment/${centsCustomerId}/payment-methods`,
  });
};

export const addCustomerPaymentMethod = data => {
  return httpClient({
    method: "POST",
    url: "/live-status/payment-methods/create",
    data,
  });
};

export const updateCustomerNotes = (storeCustomerId, data) => {
  return httpClient({
    method: "PATCH",
    url: `/live-status/customer/notes/${storeCustomerId}/update`,
    data,
  });
};
