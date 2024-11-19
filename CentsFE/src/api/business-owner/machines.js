import httpClient from "./../httpClient";

export const getDevices = (params) => {
  return httpClient({
    params,
    method: "GET",
    url: "/business-owner/machine/devices",
  });
};

export const getMachines = (params) => {
  return httpClient({
    params,
    method: "GET",
    url: "/business-owner/machine",
  });
};

export const getMachineModels = (params) => {
  return httpClient({
    params,
    method: "GET",
    url: "/business-owner/machine/machinemodel",
  });
};

export const getModelLoadTypes = (params) => {
  return httpClient({
    params,
    method: "GET",
    url: "/business-owner/machine/machineload",
  });
};

export const submitPairing = (body) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/machine/pairing",
    data: body,
  });
};

export const startMachine = (machineId, body) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/machine/${machineId}/turn`,
    data: body,
  });
};

export const validateMachineName = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/machine/validate-name",
    data,
  });
};

export const addNewMachine = (data) => {
  return httpClient({
    method: "POST",
    url: "/business-owner/machine",
    data,
  });
};

export const getMachineStats = (params) => {
  return httpClient({
    params,
    method: "GET",
    url: "/business-owner/machine/stats",
  });
};

export const getMachineDetails = (id) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/machine/${id}`,
  });
};

export const submitMachineDetails = (payload) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/machine/${payload.id}`,
    data: payload.body,
  });
};

export const getMachineTurns = (machineId, params) => {
  return httpClient({
    params,
    method: "GET",
    url: `/business-owner/machine/${machineId}/turns`,
  });
};

export const unpairDevice = (machineId) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/machine/${machineId}/un-pair`,
  });
};

export const downloadConnectionLogs = (machineId) => {
  return httpClient({
    method: "GET",
    url: `/business-owner/machine/${machineId}/connection-logs/reports`,
  });
};

export const resetTurns = (machineId) => {
  return httpClient({
    method: "POST",
    url: `/business-owner/machine/${machineId}/reset-turns`,
  });
};

export const resetCoins = (machineId) => {
  return httpClient({
    method: "PUT",
    url: `/business-owner/machine/${machineId}/reset-coins`,
  });
};
