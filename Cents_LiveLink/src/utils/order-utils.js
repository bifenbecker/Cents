import {DELIVERY_PROVIDERS, ORDER_DELIVERY_UPDATABLE_STATUSES} from "../constants/order";

export const toDollars = (amount) => {
  return `$${Number(amount || 0)?.toFixed(2) || "0.00"}`;
};

export const toDollarsOrFree = (amount) => {
  return amount ? toDollars(amount) : "FREE";
};

const getDeliveryPriceFromLineItem = ({itemTotal}) => {
  // TODO: Need to handle UBER
  return !itemTotal ? "Free" : toDollars(itemTotal);
};

export const getPerUnitString = ({serviceCategory, price, itemTotal}) => {
  if (serviceCategory === "DELIVERY") {
    return getDeliveryPriceFromLineItem({itemTotal});
  }

  let quantityUnit = serviceCategory === "PER_POUND" ? "lb" : "unit";
  return `${toDollars(price)} / ${quantityUnit}`;
};

export const getMinPriceString = ({serviceCategory, minimumPrice, hasMinPrice}) => {
  if (!hasMinPrice || serviceCategory === "DELIVERY") {
    return;
  }

  return toDollars(minimumPrice);
};

export const getPriceString = ({
  serviceCategory,
  price,
  minimumQuantity,
  minimumPrice,
  hasMinPrice,
  count,
  weightLogs,
}) => {
  if (serviceCategory === "DELIVERY") return "";

  let quantityUnit = serviceCategory === "PER_POUND" ? "lb" : "unit";

  let perUnitString = `${toDollars(price)} / ${quantityUnit}`;

  if (!hasMinPrice) {
    return `${count} x ${perUnitString}`;
  }

  let minPriceString = `${minimumQuantity?.toFixed(2)} ${quantityUnit} @ ${toDollars(
    minimumPrice
  )}`;

  if (
    serviceCategory === "PER_POUND" &&
    weightLogs[0]?.chargeableWeight > minimumQuantity
  ) {
    return (
      minPriceString +
      `|${(weightLogs[0].chargeableWeight - minimumQuantity).toFixed(
        2
      )} ${quantityUnit} @ ${perUnitString}`
    );
  }

  return minPriceString;
};

export const calculateItemTotal = ({itemTotal, serviceCategory}) => {
  if (serviceCategory === "DELIVERY") {
    return getDeliveryPriceFromLineItem({itemTotal});
  }

  return toDollars(itemTotal);
};

export const buildDeliveryDetails = (data) => {
  const {routeDelivery} = data;

  return {
    driver: {
      ...routeDelivery?.route?.driver,
      first_name: routeDelivery?.route?.driver?.firstName,
    },
    // eta is coming in secs. Convert to milli-seconds
    eta: routeDelivery?.eta * 1000,
    status: routeDelivery?.status,
    notes: routeDelivery?.notes,
    imageUrl: routeDelivery?.imageUrl,
  };
};

export const getFinalSubsidy = (laundrySubsidy, thirdPartyDeliveryCost) => {
  return laundrySubsidy > thirdPartyDeliveryCost
    ? thirdPartyDeliveryCost
    : laundrySubsidy;
};

export const canUpdateOrderDelivery = (status) =>
  ORDER_DELIVERY_UPDATABLE_STATUSES.includes(status);

export const isValidDeliveryProvider = (
  deliveryProvider,
  hasStandardSettings,
  hasDoordashSettings
) => {
  return deliveryProvider
    ? deliveryProvider === DELIVERY_PROVIDERS.ownDriver
      ? hasStandardSettings
      : hasDoordashSettings
    : false;
};
