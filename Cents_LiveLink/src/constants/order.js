export const TRANSITION_TIME = 300;

export const DELIVERY_TRACKING_ORDER_STATUSES = {
  submitted: "SUBMITTED",
  intentCreated: "INTENT_CREATED",
  scheduled: "SCHEDULED",
  enRouteToPickup: "EN_ROUTE_TO_PICKUP",
  enRouteToDropoff: "EN_ROUTE_TO_DROPOFF",
  completed: "COMPLETED",
  canceled: "CANCELLED",
};

export const VIEWS = {
  RECOMMENDED_PICKUP: "RECOMMENDED_PICKUP",
  ALL_WINDOWS_PICKUP: "ALL_WINDOWS_PICKUP",
  RETURN_QUESTION: "RETURN_QUESTION",
  SUBSCRIPTION_OFFER: "SUBSCRIPTION_OFFER",
  RECOMMENDED_RETURN: "RECOMMENDED_RETURN",
  ALL_WINDOWS_RETURN: "ALL_WINDOWS_RETURN",
  AVAILABLE_PICKUP_DATES: "AVAILABLE_PICKUP_DATES",
  AVAILABLE_RETURN_DATES: "AVAILABLE_RETURN_DATES",
};

export const DELIVERY_TYPE_KEYS = {
  OWN: "ownDelivery",
  ON_DEMAND: "onDemandDelivery",
};

export const UBER_DELIVERY_STATUS_INDICES = {
  [DELIVERY_TRACKING_ORDER_STATUSES.scheduled]: 0,
  [DELIVERY_TRACKING_ORDER_STATUSES.enRouteToPickup]: 1,
  [DELIVERY_TRACKING_ORDER_STATUSES.enRouteToDropoff]: 2,
  [DELIVERY_TRACKING_ORDER_STATUSES.completed]: 3,
};

export const OWN_DRIVER_DELIVERY_STATUS_INDICES = {
  [DELIVERY_TRACKING_ORDER_STATUSES.scheduled]: 0,
  [DELIVERY_TRACKING_ORDER_STATUSES.enRouteToDropoff]: 1,
  [DELIVERY_TRACKING_ORDER_STATUSES.completed]: 2,
};

export const DELIVERY_PROVIDERS = {
  uber: "UBER",
  ownDriver: "OWN_DRIVER",
  doorDash: "DOORDASH",
};

export const ORDER_DELIVERY_TYPES = {
  pickup: "PICKUP",
  return: "RETURN",
};

export const RETURN_METHODS = {
  delivery: "DELIVERY",
  inStorePickup: "IN_STORE_PICKUP",
};

export const ORDER_DELIVERY_UPDATABLE_STATUSES = [
  DELIVERY_TRACKING_ORDER_STATUSES.intentCreated,
  DELIVERY_TRACKING_ORDER_STATUSES.scheduled,
];

export const ORDER_TYPES = {
  residential: "RESIDENTIAL",
  service: "SERVICE",
  online: "ONLINE",
};

export const COMPLETED_OR_CANCELED_ORDER_STATUSES = ["COMPLETED", "CANCELLED"];

export const INITIAL_PICKUP_AND_DELIVERY_STATE = {
  type: null,
  storeId: null,
  pickupAt: null,
  timingsId: null,
  selectedDate: null,
  uberEstimate: null,
  deliveryWindow: [],
  totalDeliveryCost: 0,
  doorDashEstimate: null,
  deliveryProvider: null,
  thirdPartyDeliveryId: null,
};

export const orderChoices = {
  currentOrder: "currentOrder",
  currentAndFutureOrders: "currentAndFutureOrders",
};

export const orderChoicesDisplay = {
  currentOrder: "This order only",
  currentAndFutureOrders: "This and future recurring orders",
};

export const TEXT_ME_WHEN_READY = "Text me when it's ready";
export const IN_STORE_PICKUP = "In-Store Pickup";
export const WE_WILL_TEXT_YOU_WHEN_READY = "We’ll text you when it’s ready.";

export const deliveryProviders = {
  uber: "UBER",
  ownDriver: "OWN_DRIVER",
  doorDash: "DOORDASH",
};

export const SCHEDULE_TABS = {
  economy: "Economy",
  flexPickup: "Flex Pickup",
};

export const NAMED_DAYS = {
  today: "Today",
  tomorrow: "Tomorrow",
};

export const CENTS_IN_DOLLAR = 100;

export const SCHEDULE = {
  pickupTitle: "Schedule Pickup",
  returnDelivery: "Return delivery",
  pickupSubTitle: "Schedule your laundry to be picked up:",
  availableTimesTitle: "More Available Times",
  setPickupTime: "Set pickup time",
  setReturnTime: "Schedule pickup & delivery",
  recommended: "Recommended",
  moreTimes: "More Available Times",
  seeAllTimes: "See all pickup times",
  recurringOrder: "Recurring Order",
  pickup: "Pickup:",
  delivery: "Delivery:",
  pickupScheduled: "Pickup Scheduled:",
  selectPickupDate: "Select pickup date",
  selectReturnDate: "Select return date",
};

export const ORDER_MESSAGES = {
  scheduleNow: "I'll schedule my return delivery now",
  scheduleDeliveryNow: "Schedule delivery now",
  scheduleDeliveryLater: "Schedule delivery later",
  getTurnAroundInHours: (turnAroundInHours) => `est. ${turnAroundInHours} hrs`,
  getSubscriptionDiscount: (discount) => `SAVE ${discount}% ON EVERY ORDER`,
  recurringCall: "Save loads of time! Schedule your recurring pickup today.",
  pickupReminder:
    "You’ll receive a reminder to get your laundry ready the night before we are scheduled to pick it up. ",
  noTimes: "No Available times",
  trySelectFlex: "Try selecting Flex or a different day",
  trySelectEconomy: "Try selecting Economy or a different day",
};

export const COLORS = {
  background: "#F5F5F5",
  containerBackground: "#FFFFFF",
};

export const TYPOGRAPHY = {
  default:
    "Inter, Roboto Bold, Roboto Regular, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
};

export const SCHEDULE_BUTTONS = {
  edit: "Edit",
  scheduleDeliveryNow: "Schedule delivery now",
  editScheduling: "Edit scheduling",
  notNow: "Not now",
  apply: "Apply",
  setPickup: "Set pickup time",
  confirm: "Confirm",
  cancel: "Cancel",
};
