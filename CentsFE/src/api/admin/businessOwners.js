import httpClient from './../httpClient';

export const fetchBusinessOwners = params => {
  return httpClient({
    method: 'GET',
    url: 'super-admin/business-owners/',
    params
  });
};

export const submitNewCustomer = (data) => {
  return httpClient({
    method: 'POST',
    url: 'sign-up',
    data
  });
};