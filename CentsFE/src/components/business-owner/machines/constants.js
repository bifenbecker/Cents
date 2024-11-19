export const MACHINE_TYPES = {
  washer: "WASHER",
  dryer: "DRYER",
};

export const VIEW_MACHINE_TABS = {
  details: "Details",
  turns: "Turns",
};

export const DEVICE_STATUSES = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  IN_USE: "IN_USE",
};

export const DEVICE_STATUSES_MAP = {
  ONLINE: "PAIRED",
  OFFLINE: "DEVICE NOT FOUND",
  IN_USE: "PAIRED",
};

export const DEVICE_STATUSES_DISPLAY = {
  ONLINE: "Available",
  IN_USE: "In use",
  OFFLINE: "Device not found",
};

export const WIZARD_TYPES = {
  addMachine: "ADD_MACHINE",
  runMachine: "RUN_MACHINE",
  pairDeviceToNewMachine: "PAIR_DEVICE_TO_NEW_MACHINE",
  pairDeviceToMachine: "PAIR_DEVICE_TO_MACHINE",
  pairMachineToDevice: "PAIR_MACHINE_TO_DEVICE",
};

export const ADD_NEW_MACHINE_STEPS = {
  LOCATION_SELECTION: 0,
  MACHINE_TYPE: 1,
  MODEL_TYPE: 2,
  PRICING: 3,
  MACHINE_NAME: 4,
};

export const RUN_MACHINE_STEPS = {
  WASH_TYPE: 1,
  DETAILS: 2,
  CREATE_CUSTOMER: 3,
};

export const SERVICE_TYPES = {
  customerService: "CUSTOMER_SERVICE",
  technicalService: "TECHNICAL_SERVICE",
};

export const SERVICE_TYPE_DISPLAY = {
  SELF_SERVICE: "Self-Serve",
  FULL_SERVICE: "Full-Service",
  TECHNICAL_SERVICE: "Technical",
  CUSTOMER_SERVICE: "Customer Service",
};

export const MACHINE_NAMES = {
  WASHER: "Wash",
  DRYER: "Dry",
};
