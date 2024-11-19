import httpClient from "./../httpClient";

export const fetchAccountDetails = (params) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/settings/account-details",
    params,
  });
};

export const updateAccountDetails = (accountInfo, params) => {
  return httpClient({
    params,
    method: "PUT",
    url: "/business-owner/admin/settings/account-details",
    data: accountInfo,
  });
};

export const createOrUpdateRegion = (region) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/settings/regions",
    data: {
      region,
    },
  });
};

export const fetchAccountSettings = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/settings/account/settings",
  });
};

export const updateAccountSettings = (data) => {
  return httpClient({
    method: "PATCH",
    url: "/business-owner/admin/settings/account/settings",
    data,
  });
};

export const fetchStripeConnectedAccount = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/settings/account/bank/",
  });
};

export const createStripeConnectedAccount = () => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/settings/account/bank/register",
  });
};

export const fetchStripeVerificationLink = (linkType) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/settings/account/bank/verification-link",
    params: {linkType},
  });
};

export const createBankAccount = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/settings/account/bank/account-details",
    data,
  });
};

export const fetchBankAccounts = () => {
  return httpClient({
    method: "GET",
    url: "/business-owner/admin/settings/account/bank/accounts",
  });
};

export const deleteBankAccount = (id) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/admin/settings/account/bank/detach",
    data: {id},
  });
};

export const deleteBagNoteTag = (id) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/admin/settings/account/bag-note-tag/${id}/delete`,
  });
};

export const getFeedbackLink = (userId) => {
  return httpClient({
    method: "GET",
    url: "/business-owner/feedback-link",
    params: {userId},
  });
};

export const getAccountInfo = () => {
  return httpClient({
    method: "GET",
    url: `/business-owner/account`,
  });
};
