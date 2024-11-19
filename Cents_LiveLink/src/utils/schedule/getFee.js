import {toDollars} from "utils/order-utils";

export const getOwnDeliveryFee = (deliveryFee) => {
  const ownDriverDeliveryFee = deliveryFee?.ownDriver?.deliveryFeeInCents;
  return ownDriverDeliveryFee ? toDollars(ownDriverDeliveryFee / 100) : "Free";
};

export const getOnDemandDeliveryFee = (totalCost, finalSubsidyInCents) => {
  return totalCost ? toDollars(Math.max(0, totalCost - finalSubsidyInCents) / 100) : null;
};
