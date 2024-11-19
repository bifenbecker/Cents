import {RETURN_METHODS} from "../../constants/order";
import {
  CALL_ICON,
  DELIVERY_ORDER_COMPLETED,
  ON_DEMAND_DELIVERY_IN_PROGRESS,
  ON_DEMAND_PICKUP_COMPLETED,
  ON_DEMAND_PICKUP_INITIATED,
  ON_DEMAND_PICKUP_SCHEDULED,
  ORDER_CANCELED,
  ORDER_COMPLETED,
  PROCESSING,
  READY_FOR_CUSTOMER_PICKUP,
  SMS_ICON,
  STD_DELIVERY_IN_PROGRESS,
  STD_PICKUP_COMPLETED,
  STD_PICKUP_INITIATED,
  STD_PICKUP_SCHEDULED,
} from "../../assets/images";

export {RETURN_METHODS, ORDER_TYPES} from "../../constants/order";

export const RESIDENTIAL_ORDER_STATUSES = {
  submitted: "Submitted",
  processing: "Received & Processing",
  delivering: "Delivering to you",
  completed: "Complete",
};

export const ONLINE_ORDER_STATUSES = {
  submitted: "Submitted",
  processing: "Received & Processing",
  readyForPickup: "Laundry Ready",
  delivering: "Delivering to you",
  completed: "Complete",
};

export const SERVICE_ORDER_STATUSES = {
  submitted: "Submitted",
  processing: "Processing",
  readyForPickup: "Laundry Ready",
  completed: "Complete",
};

export const DELIVERY_ORDER_STATUSES = {
  submitted: "Submitted",
  processing: "Processing",
  delivering: "Delivering to you",
  completed: "Complete",
};

export const TIMELINE_CANCELED_STATUS = "Canceled";

export const DELIVERY_TRACKING_ORDER_STATUSES = {
  submitted: "SUBMITTED",
  enRouteToPickup: "EN_ROUTE_TO_PICKUP",
  enRouteToDropoff: "EN_ROUTE_TO_DROPFF",
  completed: "COMPLETED",
};

export const RETURN_METHODS_DISPLAY = {
  [RETURN_METHODS.inStorePickup]: "NO THANKS",
  [RETURN_METHODS.delivery]: "DELIVER TO ME",
};

export const serviceSelections = {
  laundry: "Laundry",
  dryCleaning: "Dry Cleaning",
};

export const orderItemCategories = {
  deliveryOrPickup: "DELIVERY",
  fixedPriceItem: "FIXED_PRICE",
  perPoundItem: "PER_POUND",
};

export const ORDER_STATUSES = {
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const IMAGE_IDS = {
  DELIVERY_ORDER_COMPLETED: DELIVERY_ORDER_COMPLETED,
  ON_DEMAND_DELIVERY_IN_PROGRESS: ON_DEMAND_DELIVERY_IN_PROGRESS,
  ON_DEMAND_PICKUP_COMPLETED: ON_DEMAND_PICKUP_COMPLETED,
  ON_DEMAND_PICKUP_INITIATED: ON_DEMAND_PICKUP_INITIATED,
  ON_DEMAND_PICKUP_SCHEDULED: ON_DEMAND_PICKUP_SCHEDULED,
  ORDER_CANCELED: ORDER_CANCELED,
  ORDER_COMPLETED: ORDER_COMPLETED,
  PROCESSING: PROCESSING,
  READY_FOR_CUSTOMER_PICKUP: READY_FOR_CUSTOMER_PICKUP,
  STD_DELIVERY_IN_PROGRESS: STD_DELIVERY_IN_PROGRESS,
  STD_PICKUP_COMPLETED: STD_PICKUP_COMPLETED,
  STD_PICKUP_SCHEDULED: STD_PICKUP_SCHEDULED,
  STD_PICKUP_INITIATED: STD_PICKUP_INITIATED,
  CALL_ICON,
  SMS_ICON,
};

export const PAYMENT_STATUSES = {
  balanceDue: "BALANCE_DUE",
  paid: "PAID",
  pending: "PENDING",
};
