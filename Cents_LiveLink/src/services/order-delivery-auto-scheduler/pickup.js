import {DateTime} from "luxon";
import OrderDeliveryAutoSchedulerBase from "./base";

class PickupAutoScheduler extends OrderDeliveryAutoSchedulerBase {
  constructor(args) {
    super(args);
    this.minimumTime = DateTime.local().setZone(this.timeZone);
    this.includeBuffer = true;
  }
}

export default PickupAutoScheduler;
