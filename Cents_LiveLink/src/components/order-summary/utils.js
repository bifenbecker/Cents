import isEmpty from "lodash/isEmpty";
import {DateTime} from "luxon";

import {toDollars} from "../../utils/order-utils";
import {
  DELIVERY_ORDER_STATUSES,
  ONLINE_ORDER_STATUSES,
  ORDER_STATUSES,
  ORDER_TYPES,
  PAYMENT_STATUSES,
  RESIDENTIAL_ORDER_STATUSES,
  SERVICE_ORDER_STATUSES,
  TIMELINE_CANCELED_STATUS,
} from "./constants";

import {
  getParsedLocalStorageData,
  setStringifiedLocalStorageData,
} from "../../utils/common";

export {toDollars} from "../../utils/order-utils";
export {timelineCircleDimensions} from "../../utils/theme";

export const getOrderToken = (order) => {
  const {orderCode, orderType, delivery} = order;

  let prefix = "";
  if (orderType === ORDER_TYPES.online || !isEmpty(delivery)) {
    prefix = "D";
  }
  // Irrespective of delivery being there for residential orders,
  // the prefix should always be R
  if (orderType === ORDER_TYPES.residential) {
    prefix = "R";
  }

  return [`${prefix}WF`, orderCode].join("-");
};

export const displayPromotionAmount = ({promotionType, discountValue}) => {
  return promotionType === "percentage-discount"
    ? `${discountValue}%`
    : toDollars(discountValue);
};

export const getCurrentTimelineStatus = (order) => {
  const {status, orderType, delivery} = order;

  if (status === ORDER_STATUSES.CANCELLED) {
    return TIMELINE_CANCELED_STATUS;
  }

  if (orderType === ORDER_TYPES.residential) {
    switch (status) {
      case "READY_FOR_PICKUP": // Residential Intake Complete
      case "DESIGNATED_FOR_PROCESSING_AT_HUB": // Reached store?
      case "IN_TRANSIT_TO_HUB": // Hub: Enroute to Hub
      case "DROPPED_OFF_AT_HUB": // Hub: Dropped off at Hub
        return RESIDENTIAL_ORDER_STATUSES.submitted;

      case "RECEIVED_AT_HUB_FOR_PROCESSING": // Hub: Received at hub??
      case "READY_FOR_PROCESSING": // Hub: Intake is completed and ready for processing
      case "HUB_PROCESSING_ORDER": // Hub: processing
      case "HUB_PROCESSING_COMPLETE": // Hub: processing complete/Driver Picked up
        return RESIDENTIAL_ORDER_STATUSES.processing;

      case "IN_TRANSIT_TO_STORE": // Hub: Enroute to Residential Address
      case "DROPPED_OFF_AT_STORE": // Residential: Dropped off at Residential Address
        return RESIDENTIAL_ORDER_STATUSES.delivering;

      case "COMPLETED": // Customer: Picked Up
        return RESIDENTIAL_ORDER_STATUSES.completed;

      default:
        return;
    }
  } else if (orderType === ORDER_TYPES.online) {
    switch (status) {
      case "SUBMITTED": // Customer created order.
      case "DRIVER_PICKED_UP_FROM_CUSTOMER": // Driver picked up from customer.
      case "READY_FOR_INTAKE": // Driver dropped off at store.
        return ONLINE_ORDER_STATUSES.submitted;

      case "DESIGNATED_FOR_PROCESSING_AT_HUB":
      case "READY_FOR_PROCESSING":
      case "IN_TRANSIT_TO_HUB":
      case "RECEIVED_AT_HUB_FOR_PROCESSING":
      case "DROPPED_OFF_AT_HUB":
      case "PAYMENT_REQUIRED":
      case "PROCESSING":
      case "HUB_PROCESSING_ORDER":
      case "HUB_PROCESSING_COMPLETE":
      case "IN_TRANSIT_TO_STORE":
        return ONLINE_ORDER_STATUSES.processing;

      case "READY_FOR_PICKUP":
      case "DROPPED_OFF_AT_STORE":
        return isEmpty(delivery)
          ? ONLINE_ORDER_STATUSES.readyForPickup
          : ONLINE_ORDER_STATUSES.processing;

      case "READY_FOR_DRIVER_PICKUP":
      case "EN_ROUTE_TO_CUSTOMER":
        return ONLINE_ORDER_STATUSES.delivering;

      case "COMPLETED":
        return ONLINE_ORDER_STATUSES.completed;

      default:
        return;
    }
  } else {
    switch (status) {
      case "READY_FOR_PROCESSING": // Order created.
      case "DESIGNATED_FOR_PROCESSING_AT_HUB": // Order created - Assigned to Hub.
        return SERVICE_ORDER_STATUSES.submitted;

      case "PROCESSING": // In-Store: processing
      case "IN_TRANSIT_TO_HUB": // Hub: In Transit
      case "DROPPED_OFF_AT_HUB": // Hub: Dropped off
      case "RECEIVED_AT_HUB_FOR_PROCESSING": // Hub: Ready for processing
      case "HUB_PROCESSING_ORDER": // Hub: processing
      case "HUB_PROCESSING_COMPLETE": // Hub: processing complete/Ready for driver pick-up
      case "IN_TRANSIT_TO_STORE": // Hub: Transit back to store
      case "DROPPED_OFF_AT_STORE": // Hub: Driver dropped the order at store
        return SERVICE_ORDER_STATUSES.processing;

      case "READY_FOR_PICKUP": // Customer: ready for pick-up
        return SERVICE_ORDER_STATUSES.readyForPickup;

      case "EN_ROUTE_TO_CUSTOMER": // Order is with delivery driver on the way to customer
      case "READY_FOR_DRIVER_PICKUP": // Delivery has been scheduled but is still at the store
        return DELIVERY_ORDER_STATUSES.delivering;

      case "COMPLETED": // Customer: Picked up.
        return SERVICE_ORDER_STATUSES.completed;

      default:
        return;
    }
  }
};

export const isUnpaidOnlineOrder = (order) => {
  return (
    order.orderType === ORDER_TYPES.online &&
    (order.paymentStatus === PAYMENT_STATUSES.balanceDue ||
      order.paymentStatus === PAYMENT_STATUSES.pending)
  );
};

export const isInProgressOrder = (order) =>
  ![ORDER_STATUSES.COMPLETED, ORDER_STATUSES.CANCELLED].includes(order.status);

export const initPaymentDetails = (paymentMethods, latestPayment) => {
  const customerPaymentMethods = paymentMethods || [];
  const currentPaymentMethod = latestPayment?.paymentMethod
    ? customerPaymentMethods.find(
        (pm) => pm.paymentMethodToken === latestPayment?.paymentMethod?.paymentMethodToken
      ) || {
        ...latestPayment?.paymentMethod,
        notSaved: true,
      }
    : customerPaymentMethods[0] || null;

  return {
    customerPaymentMethods: currentPaymentMethod?.notSaved
      ? [currentPaymentMethod, ...customerPaymentMethods]
      : customerPaymentMethods,
    currentPaymentMethod,
  };
};

export const shiftDetails = (orderDelivery, timeZone) => {
  if (isEmpty(orderDelivery)) return;

  const startTime = DateTime.fromMillis(Number(orderDelivery?.deliveryWindow[0])).setZone(
    timeZone
  );
  const endTime = DateTime.fromMillis(Number(orderDelivery?.deliveryWindow[1])).setZone(
    timeZone
  );

  return {
    day: startTime.weekdayLong,
    month: startTime.monthLong,
    date: startTime.day,
    startTime: startTime.toFormat("hh:mma"),
    endTime: endTime.toFormat("hh:mma"),
  };
};

export const setLocalStorageItemWithExpiry = (key, orderToken, ttl) => {
  const now = new Date();
  const item = {
    value: orderToken,
    expiry: now.getTime() + ttl,
  };
  setStringifiedLocalStorageData(key, item);
};

export const getLocalStorageItemWithExpiry = (key) => {
  const localStorageData = getParsedLocalStorageData(key);
  if (isEmpty(localStorageData)) {
    return null;
  }
  const now = new Date();
  // compare the expiry time of the key with the current time
  if (now.getTime() > localStorageData.expiry) {
    localStorage.removeItem(key);
    return null;
  } else {
    return localStorageData;
  }
};
