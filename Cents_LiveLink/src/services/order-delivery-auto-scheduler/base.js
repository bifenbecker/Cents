import {getDeliveryWindow} from "../../components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {bufferRequiredForOrder} from "../../components/online-order/constants";
import {
  changeDateAndTimeZone,
  getShiftWeekDay,
  getStartAndEndTimes,
} from "../../utils/date";

class OrderDeliveryAutoSchedulerBase {
  constructor({timeZone, isOwnDriver, dayWiseWindows, bufferTimeInHours}) {
    this.timeZone = timeZone;
    this.dayWiseWindows = dayWiseWindows;
    this.isOwnDriver = isOwnDriver;
    this.minimumTime = null;
    this.includeBuffer = false;
    this.bufferTimeInHours = bufferTimeInHours;
  }

  generateForDate(selectedDate) {
    const window = this.getFirstTimingForDay(selectedDate);

    return OrderDeliveryAutoSchedulerBase.buildWindowAndTimingId({
      startTime: selectedDate,
      deliveryTiming: window,
      isOwnDriver: this.isOwnDriver,
      timeZone: this.timeZone,
      includeBuffer: false,
    });
  }

  static buildWindowAndTimingId({
    startTime,
    deliveryTiming,
    isOwnDriver,
    timeZone,
    includeBuffer,
  }) {
    return deliveryTiming
      ? {
          timingsId: deliveryTiming.id,
          deliveryWindow: getDeliveryWindow(
            startTime,
            deliveryTiming,
            !isOwnDriver,
            timeZone,
            includeBuffer
          ),
        }
      : {};
  }

  getFirstTimingForDay(selectedDate) {
    return this.isOwnDriver
      ? OrderDeliveryAutoSchedulerBase.getFirstAvailableOwnDriverWindow({
          date: selectedDate,
          dayWiseWindows: this.dayWiseWindows,
          timeZone: this.timeZone,
          minimumTime: this.minimumTime,
          includeBuffer: this.includeBuffer,
          bufferTimeInHours: this.bufferTimeInHours,
        })
      : OrderDeliveryAutoSchedulerBase.getFirstAvailableOnDemandWindow({
          date: selectedDate,
          dayWiseWindows: this.dayWiseWindows,
          timeZone: this.timeZone,
          minimumTime: this.minimumTime,
          includeBuffer: this.includeBuffer,
        });
  }

  static getFirstAvailableOwnDriverWindow({
    date,
    dayWiseWindows,
    timeZone,
    minimumTime,
    includeBuffer,
    bufferTimeInHours,
  }) {
    const {timings} = dayWiseWindows.find(
      dayWiseWindow => dayWiseWindow.day === getShiftWeekDay(date)
    );

    return timings?.find(timing => {
      const startTime = changeDateAndTimeZone(date, timing?.startTime, timeZone);
      return (
        minimumTime <=
        startTime.minus({
          minutes: includeBuffer ? bufferTimeInHours * 60 : 0,
        })
      );
    });
  }

  static getFirstAvailableOnDemandWindow({
    date,
    dayWiseWindows,
    timeZone,
    minimumTime,
    includeBuffer,
  }) {
    const {timings} =
      dayWiseWindows.find(dayWiseWindow => dayWiseWindow.day === getShiftWeekDay(date)) ||
      {};

    const hasAvailableTiming = timings?.find(timing => {
      const {endTime} = getStartAndEndTimes(date, timing, timeZone);

      return (
        minimumTime <
        endTime?.minus({minutes: includeBuffer ? bufferRequiredForOrder.DOORDASH : 0})
      );
    });
    if (hasAvailableTiming) {
      return timings?.[0];
    }
  }
}

export default OrderDeliveryAutoSchedulerBase;
