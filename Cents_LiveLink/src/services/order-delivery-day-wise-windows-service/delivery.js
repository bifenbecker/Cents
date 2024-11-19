import {getEarliestDeliveryStartTime} from "../../components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {ORDER_DELIVERY_TYPES} from "../../constants/order";
import OrderDeliveryDayWiseWindowsService from "./base";

class DeliveryDayWiseWindowsService extends OrderDeliveryDayWiseWindowsService {
  constructor({
    timeZone,
    orderType,
    onError,
    pickupWindow,
    delivery,
    currentDayWiseWindows,
    isProcessingCompleted,
    intakeCompletedAtInMillis,
    turnAroundInHours,
    onDayWiseWindowsUpdate,
    rescheduleDelivery,
    allWindowsUpdate,
  }) {
    super({
      timeZone,
      orderType,
      onError,
      onDayWiseWindowsUpdate,
      rescheduleDelivery,
      allWindowsUpdate,
    });
    this.type = ORDER_DELIVERY_TYPES.return;
    this.delivery = delivery;
    this.pickupStartTimeInMillis = pickupWindow?.[0];
    this.isProcessingCompleted = isProcessingCompleted;
    this.intakeCompletedAtInMillis = intakeCompletedAtInMillis;
    this.turnAroundInHours = turnAroundInHours;
    this.currentDayWiseWindows = currentDayWiseWindows;
    this.includeBuffer = isProcessingCompleted;
  }

  getOnDemandDayWiseWindows({initialDayWiseWindows}) {
    super.getOnDemandDayWiseWindows({
      initialDayWiseWindows,
      minTime: this.getMinTimeForDelivery(),
    });
  }

  async getOwnDriverDayWiseWindows({
    storeId,
    zipCode,
    onLoading,
    currentOrderDelivery,
    bufferTimeInHours,
  }) {
    await super.getOwnDriverDayWiseWindows({
      storeId,
      minTime: this.getMinTimeForDelivery(),
      zipCode,
      onLoading,
      currentOrderDelivery,
      bufferTimeInHours,
    });
  }

  getMinTimeForDelivery() {
    return getEarliestDeliveryStartTime({
      timeZone: this.timeZone,
      isProcessingCompleted: this.isProcessingCompleted,
      intakeCompletedAtInMillis: this.intakeCompletedAtInMillis,
      turnAroundInHours: this.turnAroundInHours,
      pickupStartTimeInMillis: this.pickupStartTimeInMillis,
    });
  }
}

export default DeliveryDayWiseWindowsService;
