import {DateTime} from "luxon";

import {bufferRequiredForOrder} from "./constants";
import {DELIVERY_PROVIDERS} from "../../constants/order";
import {FETCHING_STATUS} from "constants/api";

export {formatAddress, createAddressPayload} from "../../utils/address";

export const toDollars = (amount) => {
  return `$${amount?.toFixed(2) || "0.00"}`;
};

export const getServicePriceBreakdown = (service) => {
  const {prices, hasMinPrice} = service;
  const priceString = getPriceString(service);

  let minPriceString;
  let isShortMinPriceDescription = false;

  if (hasMinPrice) {
    const {storePrice, minQty, minPrice} = prices[0];

    isShortMinPriceDescription =
      (Number(minQty || 0) * Number(storePrice || 0)).toFixed(2) ===
      Number(minPrice || 0).toFixed(2);
    minPriceString = isShortMinPriceDescription
      ? isShortMinPriceDescription && minQty
        ? `(min. ${minQty}lbs)`
        : ""
      : `Min: First ${minQty}lbs @ ${toDollars(minPrice)}`;
  }

  return {priceString, minPriceString, isShortMinPriceDescription};
};

export const getPriceString = ({serviceCategory, prices}) => {
  const {storePrice} = prices[0];
  return `${toDollars(storePrice)} / ${
    serviceCategory.category === "PER_POUND" ? "lb" : "unit"
  }`;
};

export const getMinPriceString = ({prices}) => {
  const {minPrice} = prices[0];
  return toDollars(minPrice);
};

export const getTimeFromMilliSeconds = (timeInMilliSeconds, timeZone) => {
  return DateTime.fromMillis(Number(timeInMilliSeconds)).setZone(timeZone);
};

export const isValidReturnWindowForProvider = (
  pickupStartWindow,
  deliveryWindow,
  turnAroundInHours,
  timeZone
) => {
  if (!deliveryWindow?.length) {
    return false;
  }
  const pickupTime = getTimeFromMilliSeconds(Number(pickupStartWindow), timeZone);
  const deliveryScheduleTime = getTimeFromMilliSeconds(deliveryWindow[0], timeZone);
  const minDiff = deliveryScheduleTime?.diff(pickupTime, "minutes")?.toObject()?.minutes;
  return minDiff >= turnAroundInHours * 60;
};

export const isValidWindowForProvider = (deliveryWindow, deliveryProvider, timeZone) => {
  const shiftTime = getTimeFromMilliSeconds(
    deliveryWindow[deliveryProvider === DELIVERY_PROVIDERS.ownDriver ? 0 : 1],
    timeZone
  );
  const currentTime = DateTime.local().setZone(timeZone);
  const minDiff = shiftTime?.diff(currentTime, "minutes")?.toObject()?.minutes || 0;
  return minDiff > bufferRequiredForOrder[deliveryProvider];
};

export const getAvailableOwnDriverOrOnDemandStoreId = (
  ownDeliveryStore,
  onDemandDeliveryStore
) => {
  if (ownDeliveryStore?.storeId) {
    return ownDeliveryStore?.storeId;
  }

  if (isOnDemandEnabled(onDemandDeliveryStore)) {
    return onDemandDeliveryStore?.storeId;
  }
};

export const isOnDemandEnabled = (onDemandDeliveryStore) => {
  const doordashStores = process.env.REACT_APP_DOORDASH_STORES.split(",");

  return (
    onDemandDeliveryStore?.storeId &&
    onDemandDeliveryStore?.active &&
    onDemandDeliveryStore?.dayWiseWindows?.length &&
    (onDemandDeliveryStore?.doorDashEnabled ||
      doordashStores?.includes(onDemandDeliveryStore?.storeId?.toString()))
  );
};

export const getTitleState = (fetchingStatus, isFirstVisit) => {
  if (fetchingStatus === FETCHING_STATUS.FULFILLED) {
    if (isFirstVisit) {
      return "firstVisit";
    } else {
      return "greeting";
    }
  } else {
    return "firstVisit";
  }
};
