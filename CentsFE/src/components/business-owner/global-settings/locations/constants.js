export const deliveryWizardTypes = {
  GENERAL_DELIVERY_SETTINGS: "GENERAL_DELIVERY_SETTINGS",
  OWN_DELIVERY_SETTINGS: "OWN_DELIVERY_SETTINGS",
  ON_DEMAND_DELIVERY_SETTINGS: "ON_DEMAND_DELIVERY_SETTINGS",
  DELIVERY_SETTINGS_ENABLED: "DELIVERY_SETTINGS_ENABLED",
};

export const editableDeliveryScreenTypes = {
  // GENERAL_DELIVERY_SETTINGS
  DELIVERY_SERVICES: "DELIVERY_SERVICES",
  TURNAROUND_TIME: "TURNAROUND_TIME",
  RECURRING_DISCOUNT: "RECURRING_DISCOUNT",
  CUSTOM_MESSAGE: "CUSTOM_MESSAGE",

  // OWN_DELIVERY_SETTINGS
  SERVICE_AREA: "SERVICE_AREA",
  PICKUP_AND_DELIVERY_WINDOWS: "PICKUP_AND_DELIVERY_WINDOWS",
  // DRIVERS: "DRIVERS",
  PICKUP_AND_DELIVERY_FEE: "PICKUP_AND_DELIVERY_FEE",
  PICKUP_AND_DELIVERY_BUFFER: "PICKUP_AND_DELIVERY_BUFFER",

  // ON_DEMAND_DELIVERY_SETTINGS
  PICKUP_AND_DROPOFF_HOURS: "PICKUP_AND_DROPOFF_HOURS",
  DELIVERY_SUBSIDY: "DELIVERY_SUBSIDY",
};

export const locationTabs = [
  {
    value: "details",
    label: "Details",
  },
  {
    value: "services&products",
    label: "Services & Products",
  },
  {
    value: "delivery-settings",
    label: "Delivery Settings",
  },
  // {
  //     value: 'settings',
  //     label: 'Settings',
  // },
];

export const TurnAroundTimeList = ["24", "48", "72", "Custom"];

export const MaxTurnAroundTime = 168;

export const BufferDurationList = [
  {label: "30 mins", value: 0.5},
  {label: "1 hour", value: 1},
  {label: "24 hours", value: 24},
  {label: "Custom", value: "custom"},
];

export const MaxBufferTime = 168;

export const ProcessingType = {
  basic: "BASIC",
  advanced: "ADVANCED",
};

export const ServicePricingOption = {
  storeRetailPricingOption: "RETAIL",
  deliveryTierPricing: "DELIVERY_TIER",
};

export const subsidyTypes = {
  onlineOrders: "online-orders-subsidy",
  walkinOrders: "walk-in-orders-subsidy",
};
