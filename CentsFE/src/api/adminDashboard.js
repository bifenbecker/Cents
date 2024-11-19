import httpClient from './httpClient';

export const businessOwnersList = params => {
  return httpClient({
    method: 'GET',
    url: 'super-admin/business-owners/list',
    params
  });
};

export const fetchDevicesData = params => {
  return httpClient({
    method: 'GET',
    url: 'super-admin/devices/list',
    params
  });
};

export const uploadDevicesData = params => {
  return httpClient({
    method: 'POST',
    url: 'super-admin/devices/create',
    // headers: {
    //   'content-type': 'multipart/form-data'
    // },
    data: params
  });
};