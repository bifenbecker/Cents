export const orderPickUpSteps = {
  details: "order-details",
  finishingUp: "finishing-up",
};

export const deliveryProviders = {
  uber: "UBER",
  ownDriver: "OWN_DRIVER",
  doorDash: "DOORDASH",
};

export const orderFields = [
  "servicePriceId",
  "serviceModifierIds",
  "customerNotes",
  "isHangDrySelected",
  "hangDryInstructions",
  "orderNotes",
  "customerAddressId",
  "paymentToken",
  "promoCode",
  "bagCount",
  "returnMethod",
  "hasDryCleaning",
];

export const mandatoryOrderFields = [
  "paymentToken",
  "returnMethod",
  "servicePriceId",
  "customerAddressId",
];

export const bufferRequiredForOrder = {
  [deliveryProviders.uber]: 10,
  [deliveryProviders.doorDash]: 10,
  [deliveryProviders.ownDriver]: 20,
};

export const orderDeliveryFields = ["pickup", "delivery"];

export const orderDeliverySubFields = [
  "type",
  "timingsId",
  "deliveryProvider",
  "deliveryWindow",
  "thirdPartyDeliveryId",
  "totalDeliveryCost",
  "courierTip",
  "subsidyInCents",
  "thirdPartyDeliveryCostInCents",
];

export const onDemandDeliveryTypes = {
  pickup: "PICKUP",
  delivery: "DELIVERY",
  pickupAndDelivery: "PICKUP_AND_DELIVERY",
};

export const SERVICE_CATEGORY_TYPES = {
  DRY_CLEANING: "DRY_CLEANING",
  LAUNDRY: "LAUNDRY",
  ALTERATIONS: "ALTERATIONS",
};

export const cloneOrderState = {
  REVIEW: "REVIEW_CLONE_ORDER",
  EDIT: "EDIT_CLONE_ORDER",
  INITIAL: "NO_CLONE_ORDER",
};
