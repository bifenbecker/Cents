import {DateTime} from "luxon";
import isEmpty from "lodash/isEmpty";

import {
  getEarliestDeliveryStartTime,
  hasSameDeliveryWindow,
} from "../components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {bufferRequiredForOrder} from "../components/online-order/constants";
import {DELIVERY_PROVIDERS, ORDER_TYPES, RETURN_METHODS} from "../constants/order";
import {canUpdateOrderDelivery} from "../utils";
import {getTimeFromMilliSeconds} from "../utils/date";

class OrderDeliveryValidator {
  constructor({
    pickup,
    delivery,
    timeZone,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    orderType,
    returnMethod,
    bufferTimeInHours,
  }) {
    this.pickup = pickup;
    this.delivery = delivery;
    this.timeZone = timeZone;
    this.isProcessingCompleted = isProcessingCompleted;
    this.intakeCompletedAtInMillis = intakeCompletedAtInMillis;
    this.turnAroundInHours = turnAroundInHours;
    this.returnMethod = returnMethod;
    this.canUpdatePickup = canUpdateOrderDelivery(pickup?.status);
    this.canUpdateReturn = canUpdateOrderDelivery(delivery?.status);
    this.isNotOnlineOrder = orderType !== ORDER_TYPES.online;
    this.isResidentialOrder = orderType === ORDER_TYPES.residential;
    this.bufferTimeInMinutes = bufferTimeInHours * 60;
  }

  // Walk-in order or online order for which pickup can't be updated
  isPickupNotUpdatable() {
    return this.isNotOnlineOrder || (this.pickup?.status && !this.canUpdatePickup);
  }

  isReturnNotUpdatable() {
    return (
      this.isResidentialOrder ||
      !this.delivery.timingsId ||
      (this.delivery?.status && !this.canUpdateReturn)
    );
  }

  isPickupValid() {
    if (this.isPickupNotUpdatable()) {
      //  If pickup is not updatable then there is no change in the pickup
      return true;
    } else {
      // When pickup can be updated
      // if pickup is valid (buffer is included)
      // else Pickup is not valid
      // Update pickup -> Include Buffer

      return (
        this.pickup?.deliveryWindow?.length &&
        this.isOrderDeliveryWindowValid({
          deliveryWindow: this.pickup?.deliveryWindow,
          deliveryProvider: this.pickup?.deliveryProvider,
          timeZone: this.timeZone,
          includeBuffer: true,
          minimumStartTime: DateTime.local().setZone(this.timeZone),
        })
      );
    }
  }

  isReturnValid() {
    // Validate delivery

    // Step 1: Pickup is not updatable
    // If processing is completed -> take current time for delivery including buffer
    // If delivey invalid -> Update delivery (minTime = CurrentTime + buffer)
    // Else -> Pickup || intakeCompleted time + turnAround time as minTime  -> max(minTime, currentTime) Do not include buffer
    // If delivey invalid -> Update delivery (max(minTime, currentTime))

    // Step 2: Pickup is updatable
    // Check if delivery is valid (Pickup + turnAroundTime) No buffer
    // if delivery is invalid -> Update delivery (pickup + turnAroundTime)

    const isPickupNotUpdatable = this.isPickupNotUpdatable();
    const includeBuffer = isPickupNotUpdatable ? this.isProcessingCompleted : false;
    const minimumStartTime = isPickupNotUpdatable
      ? getEarliestDeliveryStartTime({
          timeZone: this.timeZone,
          isProcessingCompleted: this.isProcessingCompleted,
          intakeCompletedAtInMillis: this.intakeCompletedAtInMillis,
          turnAroundInHours: this.turnAroundInHours,
          pickupStartTimeInMillis: this.pickup?.deliveryWindow?.[0],
        })
      : this.getLatestPickupPlusTurnAroundTime();
    return (
      this.returnMethod === RETURN_METHODS?.delivery &&
      !isEmpty(this.delivery) &&
      this.delivery?.deliveryWindow?.length &&
      (isPickupNotUpdatable ? true : this.pickup?.deliveryWindow?.length) &&
      this.isOrderDeliveryWindowValid({
        deliveryWindow: this.delivery?.deliveryWindow,
        deliveryProvider: this.delivery?.deliveryProvider,
        timeZone: this.timeZone,
        includeBuffer,
        minimumStartTime,
      })
    );
  }

  getLatestPickupPlusTurnAroundTime() {
    const pickupPlusTurnAroundTime = getTimeFromMilliSeconds(
      this.pickup?.deliveryWindow?.[0],
      this.timeZone
    ).plus({
      hours: this.turnAroundInHours,
    });
    return pickupPlusTurnAroundTime > DateTime.local().setZone(this.timeZone)
      ? pickupPlusTurnAroundTime
      : DateTime.local().setZone(this.timeZone);
  }

  // To check if the order is scheduled in the past
  isOrderDeliveryWindowValid({
    deliveryWindow,
    deliveryProvider,
    timeZone,
    includeBuffer,
    minimumStartTime,
  }) {
    let orderScheduledDate = getTimeFromMilliSeconds(deliveryWindow?.[0], timeZone);
    // If it is scheduled in the past time for current date then, Check with buffer

    orderScheduledDate = includeBuffer
      ? deliveryProvider === DELIVERY_PROVIDERS.ownDriver
        ? orderScheduledDate.minus({
            minutes: this.bufferTimeInMinutes,
          })
        : getTimeFromMilliSeconds(deliveryWindow[1], timeZone).minus({
            minutes: bufferRequiredForOrder.DOORDASH,
          })
      : orderScheduledDate;

    return orderScheduledDate >= minimumStartTime;
  }

  static canRetainDeliveryWindow(
    orderDelivery,
    ownDriverDeliverySettings,
    onDemandDeliverySettings,
    dayWiseWindows,
    timeZone
  ) {
    const isThirdPartyDelivery =
      orderDelivery.deliveryProvider !== DELIVERY_PROVIDERS.ownDriver;
    // If the delivery provider is own driver and
    // the windows selected are available in the new dayWiseWindows,
    // then don't change delivery or the windows.
    return (
      orderDelivery.deliveryProvider &&
      (isThirdPartyDelivery
        ? onDemandDeliverySettings?.dayWiseWindows?.length
        : ownDriverDeliverySettings?.active) &&
      orderDelivery.deliveryWindow?.length &&
      hasSameDeliveryWindow(
        orderDelivery.deliveryWindow,
        dayWiseWindows,
        timeZone,
        isThirdPartyDelivery
      )
    );
  }
}

export default OrderDeliveryValidator;
