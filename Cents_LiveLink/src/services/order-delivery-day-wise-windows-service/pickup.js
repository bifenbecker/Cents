import {ORDER_DELIVERY_TYPES} from "../../constants/order";
import OrderDeliveryDayWiseWindowsService from "./base";

class PickupDayWiseWindowsService extends OrderDeliveryDayWiseWindowsService {
  constructor({
    timeZone,
    orderType,
    onError,
    pickup,
    currentDayWiseWindows,
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
    this.type = ORDER_DELIVERY_TYPES.pickup;
    this.pickup = pickup;
    this.currentDayWiseWindows = currentDayWiseWindows;
  }
}

export default PickupDayWiseWindowsService;
