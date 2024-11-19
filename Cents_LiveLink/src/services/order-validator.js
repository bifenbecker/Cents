import {mandatoryOrderFields} from "../components/online-order/constants";
import {DELIVERY_PROVIDERS, ORDER_TYPES, RETURN_METHODS} from "../constants/order";
import {canUpdateOrderDelivery} from "../utils";

import OrderDeliveryValidator from "./order-delivery-validator";

export const ORDER_VALIDATOR_CALLED_FROM = {
  CREATE_ONLINE_ORDER: "CREATE_ONLINE_ORDER",
  MANAGE_ORDER: "MANAGE_ORDER",
};

const validationMsgs = {
  servicePriceId: "Cannot create order unless a service is selected.",
  customerAddressId: "Cannot create order unless an address is selected.",
  paymentToken: "Cannot create order unless payment details are configured.",
  type: "Could not configure the mode of pickup/delivery.",
  deliveryProvider: "Could not configure the mode of pickup/delivery.",
  thirdPartyDeliveryId: "Could not configure pickup/delivery.",
  deliveryWindow: "Pickup/delivery time window is not valid.",
  returnMethod: "Could not configure the mode of return.",
  delivery: "Please schedule delivery for the order",
  pickup: "Please schedule pickup for the order",
};

class OrderValidator {
  constructor(order, options) {
    this.order = order;
    this.intakeCompletedAt = options.intakeCompletedAt;
    this.orderType = options.orderType;
    this.timeZone = options.timeZone;
    this.isProcessingCompleted = options.isProcessingCompleted;
    this.turnAroundInHours = options.turnAroundInHours;
    this.bufferTimeInHours = options.bufferTimeInHours;
  }

  // from - CREATE_ONLINE_ORDER || MANAGE_ORDER;
  invalidErrorMessage(from) {
    const invalidField = Object.keys(this.order)?.find(key => {
      return mandatoryOrderFields.includes(key) && !this.order[key];
    });
    const {pickup, delivery} = this.order.orderDelivery;

    let ignorePickupValidation = true;
    let ignoreReturnValidation = true;

    if (from === ORDER_VALIDATOR_CALLED_FROM.CREATE_ONLINE_ORDER) {
      ignorePickupValidation = false;
      ignoreReturnValidation = this.order.returnMethod === RETURN_METHODS.inStorePickup;
    } else {
      switch (this.orderType) {
        case ORDER_TYPES.service:
          ignorePickupValidation = true;
          ignoreReturnValidation =
            !this.order.returnMethod ||
            this.order.returnMethod === RETURN_METHODS.inStorePickup;
          break;

        case ORDER_TYPES.online:
          ignorePickupValidation = !canUpdateOrderDelivery(pickup.status);
          ignoreReturnValidation =
            !this.order.returnMethod ||
            this.order.returnMethod === RETURN_METHODS.inStorePickup ||
            !canUpdateOrderDelivery(delivery.status);
          break;

        default:
          ignorePickupValidation = true;
          ignoreReturnValidation = true;
          break;
      }
    }

    if (invalidField && !(invalidField === "servicePriceId" && this.intakeCompletedAt)) {
      if (
        invalidField !== "paymentToken" ||
        !(this.isServiceOrder() && ignoreReturnValidation)
      ) {
        return validationMsgs[invalidField];
      }
    }

    const orderDeliveryValidator = new OrderDeliveryValidator({
      pickup,
      delivery,
      timeZone: this.timeZone,
      isProcessingCompleted: this.isProcessingCompleted,
      intakeCompletedAtInMillis: this.intakeCompletedAt
        ? new Date(this.intakeCompletedAt).getTime()
        : null,
      turnAroundInHours: this.turnAroundInHours,
      orderType: this.orderType,
      returnMethod: this.order.returnMethod,
      bufferTimeInHours: this.bufferTimeInHours,
    });

    const isPickupWindowValid =
      ignorePickupValidation || orderDeliveryValidator.isPickupValid();
    const isDeliveryValid =
      ignoreReturnValidation || orderDeliveryValidator.isReturnValid();

    if (!isPickupWindowValid || !isDeliveryValid) {
      return OrderValidator.orderDeliveriesErrorMessage(
        isPickupWindowValid,
        isDeliveryValid
      );
    }
    const pickupError = ignorePickupValidation
      ? null
      : this.checkOrderDeliveryValidity(pickup);

    if (pickupError) {
      return pickupError;
    } else if (!ignoreReturnValidation) {
      return this.checkOrderDeliveryValidity(delivery);
    }
    return;
  }

  isServiceOrder() {
    return this.orderType === ORDER_TYPES.service;
  }

  checkOrderDeliveryValidity(pickupOrDelivery) {
    const {
      type,
      deliveryProvider,
      deliveryWindow,
      thirdPartyDeliveryId,
    } = pickupOrDelivery;
    switch (true) {
      case !type:
        return validationMsgs.type;
      case !deliveryProvider:
        return validationMsgs.deliveryProvider;
      case !deliveryWindow?.length:
        return validationMsgs.deliveryWindow;
      case deliveryProvider === DELIVERY_PROVIDERS.uber && !thirdPartyDeliveryId:
        return validationMsgs.thirdPartyDeliveryId;
      default:
        break;
    }
  }

  static orderDeliveriesErrorMessage(isPickupWindowValid, isReturnWindowValid) {
    const invalidDeliveries = [
      isPickupWindowValid ? "" : "pickup",
      isReturnWindowValid ? "" : "delivery",
    ].filter(v => !!v);
    return `Your scheduled ${invalidDeliveries.join(" and ")} ${
      invalidDeliveries.length > 1 ? "times are" : "time is"
    } no longer available. Please select another day and time.`;
  }
}

export default OrderValidator;
