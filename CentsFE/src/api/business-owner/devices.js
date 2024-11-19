import httpClient from "./../httpClient";

export const fetchBatches = (params) => {
  return httpClient({
    method: "GET",
    url: "business-owner/admin/batches",
    params,
  });
};

export const assignBatchToLocation = (batchId, locationId) => {
  return httpClient({
    method: "POST",
    url: "business-owner/admin/batches/",
    data: {
      batchId,
      storeId: locationId,
    },
  });
};

export const fetchDevices = (params) => {
  return httpClient({
    method: "GET",
    url: "business-owner/admin/locations/devices",
    params,
  });
};

export const uploadPairingCSV = (params) => {
  return httpClient({
    method: "POST",
    url: "business-owner/machine/csv-upload",
    headers: {
      "content-type": "multipart/form-data",
    },
    data: params,
  });
};
