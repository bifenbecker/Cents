import {
  getEarliestDeliveryStartTime,
  getNextAvailableDay,
} from "../../components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {DELIVERY_PROVIDERS} from "../../constants/order";
import {
  changeDateAndTimeZone,
  getShiftWeekDay,
  getTimeFromMilliSeconds,
} from "../../utils/date";

import OrderDeliveryAutoSchedulerBase from "./base";

class ReturnAutoScheduler extends OrderDeliveryAutoSchedulerBase {
  constructor(args) {
    super(args);
    const {
      isProcessingCompleted,
      intakeCompletedAtInMillis,
      turnAroundInHours,
      pickupStartTimeInMillis,
    } = args;
    this.minimumTime = getEarliestDeliveryStartTime({
      timeZone: this.timeZone,
      isProcessingCompleted,
      intakeCompletedAtInMillis,
      turnAroundInHours,
      pickupStartTimeInMillis,
    });
    this.isProcessingCompleted = isProcessingCompleted;
    this.intakeCompletedAtInMillis = intakeCompletedAtInMillis;
    this.turnAroundInHours = turnAroundInHours;
    this.pickupStartTimeInMillis = pickupStartTimeInMillis;
    this.includeBuffer = isProcessingCompleted;
  }

  autoScheduleAfterLatestDeliveryTime({
    currentDelivery,
    isDeliveryWindowSelectedManually,
  }) {
    // NOTE: this.minimumTime is nothing but the latest delivery start time.
    // Updating dayWiseWindows to make sure the other functions work.
    // Keeping a copy to reset the date after autoscheduling is done.
    const dayWiseWindows = this.dayWiseWindows;
    const minimumTime = this.minimumTime;

    this.dayWiseWindows =
      this.dayWiseWindows?.filter(dayWindows => dayWindows?.timings?.length) || [];
    if (
      (!this.pickupStartTimeInMillis && !this.intakeCompletedAtInMillis) ||
      !this.dayWiseWindows?.length
    ) {
      return {};
    }
    const currentDeliveryStartTime = currentDelivery?.deliveryWindow?.[0]
      ? getTimeFromMilliSeconds(currentDelivery?.deliveryWindow?.[0], this.timeZone)
      : null;

    // If the current delivery time is already greater than the min time,
    // then return the current one only
    const deliveryProvider = this.isOwnDriver
      ? DELIVERY_PROVIDERS.ownDriver
      : DELIVERY_PROVIDERS.doorDash;

    if (
      currentDeliveryStartTime &&
      isDeliveryWindowSelectedManually &&
      currentDeliveryStartTime > this.minimumTime
    ) {
      return {
        ...currentDelivery,
        deliveryProvider,
        selectedDate: currentDeliveryStartTime,
      };
    }

    const initialDeliveryDay = getShiftWeekDay(this.minimumTime);
    const daysAvailable = (this.dayWiseWindows || []).map(timing => timing.day);
    let deliveryTiming;

    if (daysAvailable.includes(initialDeliveryDay)) {
      deliveryTiming = this.getFirstTimingForDay(this.minimumTime);
    }

    // If delivery day does not have desired time window or delivery day is not in daysAvailable
    if (!deliveryTiming) {
      // Find the next available delivery day.
      const {newDay: newDeliveryDay, daysToBeMoved} = getNextAvailableDay(
        initialDeliveryDay,
        daysAvailable
      );
      this.minimumTime = this.minimumTime.plus({days: daysToBeMoved});

      if (daysToBeMoved <= 6) {
        const {timings} = this.dayWiseWindows?.find(
          timings => timings.day === newDeliveryDay
        ) || {
          timings: [],
        };
        deliveryTiming = timings[0];

        if (!this.isOwnDriver) {
          // Since we need to take the first available slot, for third party providers,
          // it should be start from the startTime of the timing(since there will be only one timing)
          this.minimumTime = changeDateAndTimeZone(
            this.minimumTime,
            deliveryTiming?.startTime,
            this.timeZone
          );
        }
      }
    }

    const autoDelivery = OrderDeliveryAutoSchedulerBase.buildWindowAndTimingId({
      startTime: this.minimumTime,
      deliveryTiming,
      isOwnDriver: this.isOwnDriver,
      timeZone: this.timeZone,
      includeBuffer: this.includeBuffer,
    });

    const autoScheduledDeliveryDate = autoDelivery?.deliveryWindow?.[0]
      ? getTimeFromMilliSeconds(autoDelivery.deliveryWindow[0], this.timeZone)
      : null;

    const updatedDelivery = {
      deliveryWindow: [],
      timingsId: null,
      ...autoDelivery,
      selectedDate: autoScheduledDeliveryDate,
      deliveryProvider,
    };

    // Resetting these back.
    this.minimumTime = minimumTime;
    this.dayWiseWindows = dayWiseWindows;

    return updatedDelivery;
  }
}

export default ReturnAutoScheduler;
