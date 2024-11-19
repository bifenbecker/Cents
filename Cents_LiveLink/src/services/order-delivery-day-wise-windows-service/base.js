import sortBy from "lodash/sortBy";
import {DateTime} from "luxon";
import {fetchOwnDriverDeliveryWindows} from "../../api/online-order";

import {isThirdPartyWindowAvailable} from "../../components/common/order-sections/delivery-windows/service-provider-time-selection/utils";
import {ORDER_DELIVERY_TYPES} from "../../constants/order";
import {
  changeDateAndTimeZone,
  getNextDays,
  getShiftWeekDay,
  getTimeFromMilliSeconds,
  isSameDay,
} from "../../utils/date";
import OrderDeliveryAutoSchedulerBase from "../order-delivery-auto-scheduler/base";

class OrderDeliveryDayWiseWindowsService {
  constructor({
    timeZone,
    orderType,
    onDayWiseWindowsUpdate,
    onError,
    rescheduleDelivery,
    allWindowsUpdate,
  }) {
    this.timeZone = timeZone;
    this.orderType = orderType;
    this.onError = onError;
    this.onDayWiseWindowsUpdate = onDayWiseWindowsUpdate;
    this.includeBuffer = true;
    this.rescheduleDelivery = rescheduleDelivery;
    this.allWindowsUpdate = allWindowsUpdate;
  }

  getOnDemandDayWiseWindows({initialDayWiseWindows, minTime}) {
    const currentTime = minTime ? minTime : DateTime.local().setZone(this.timeZone);
    const nextSevenDays = getNextDays(7, this.timeZone, currentTime);
    let daysToDisplay = nextSevenDays || [];

    const dayWiseWindows = daysToDisplay?.map((date, index) => {
      // if the index is 0, then it is today.

      const isFirstDay = !index;
      const day = getShiftWeekDay(date);
      const dayTimings = this.getTimings(initialDayWiseWindows, day);

      return {
        date,
        day,
        timings:
          dayTimings &&
          dayTimings?.[0] &&
          (!isFirstDay ||
            isThirdPartyWindowAvailable(currentTime, dayTimings[0], this.timeZone))
            ? dayTimings
            : [],
      };
    });

    if (this.shouldUpdateDayWiseWindows(dayWiseWindows)) {
      this.onDayWiseWindowsUpdate(dayWiseWindows);
      this.allWindowsUpdate && this.allWindowsUpdate({onDemand: dayWiseWindows});
    }

    return dayWiseWindows;
  }

  async getOwnDriverDayWiseWindows({
    storeId,
    minTime,
    zipCode,
    onLoading,
    currentOrderDelivery,
    bufferTimeInHours,
  }) {
    const startTime = minTime ? minTime : DateTime.local().setZone(this.timeZone);
    if (
      this.currentDayWiseWindows?.[0]?.date &&
      startTime &&
      isSameDay(this.currentDayWiseWindows?.[0]?.date, startTime, this.timeZone) &&
      OrderDeliveryAutoSchedulerBase.getFirstAvailableOwnDriverWindow({
        date: this.currentDayWiseWindows?.[0]?.date,
        dayWiseWindows: this.currentDayWiseWindows,
        timeZone: this.timeZone,
        minimumTime: startTime,
        includeBuffer: this.includeBuffer,
        bufferTimeInHours,
      })?.id
    ) {
      if (this.type === ORDER_DELIVERY_TYPES.return) {
        this.rescheduleDelivery(this.type);
      }
      return;
    }
    const startDate = (
      minTime ? minTime : DateTime.local().setZone(this.timeZone)
    )?.startOf("day")?.ts;

    try {
      onLoading(true);
      const params = {
        startDate,
        serviceType: this.type,
        zipCode,
      };
      const resp = await fetchOwnDriverDeliveryWindows(storeId, params);
      if (resp.data.success) {
        const responseData = resp?.data?.dayWiseWindows?.length
          ? resp?.data?.dayWiseWindows
          : [];
        const nextSevenDays = responseData?.map((dayWiseWindow) =>
          getTimeFromMilliSeconds(
            dayWiseWindow?.current_date_in_unix * 1000,
            this.timeZone
          ).startOf("day")
        );

        const dayWiseWindows = nextSevenDays?.map((date) => {
          // const isFirstDay = isSameDay(date, firstDay, timeZone);
          const day = getShiftWeekDay(date);

          return {
            date,
            day,
            timings: this.getOwnDriverTimings(
              responseData,
              day,
              minTime ? minTime : DateTime.local().setZone(this.timeZone),
              currentOrderDelivery
            ),
          };
        });
        if (this.shouldUpdateDayWiseWindows(dayWiseWindows)) {
          this.onDayWiseWindowsUpdate(dayWiseWindows);
          this.allWindowsUpdate && this.allWindowsUpdate({ownDriver: dayWiseWindows});
        }
        return dayWiseWindows;
      }
    } catch (error) {
      this.onError(
        error?.response?.data?.error || "Error while fetching on own driver windows"
      );
    } finally {
      onLoading(false);
    }
  }

  getTimings(dayWiseWindows, day) {
    const dayWiseWindow = dayWiseWindows?.find(
      (dayWiseWindow) => Number(dayWiseWindow?.day) === day
    );

    return dayWiseWindow?.timings?.map((timing) => {
      return {
        ...timing,
        day,
      };
    });
  }

  getOwnDriverTimings(dayWiseWindows, day, minTimeWithTurnAround, currentOrderDelivery) {
    const dayWiseWindow = dayWiseWindows?.find(
      (dayWiseWindow) => Number(dayWiseWindow?.day) === day
    );
    //  If timings is null or undefined return empty array
    if (dayWiseWindow?.timings) {
      return dayWiseWindow?.timings
        ?.map((timing) => {
          let updatedTimings = {...timing};

          if (minTimeWithTurnAround?.ts) {
            const currentDate = getTimeFromMilliSeconds(
              dayWiseWindow?.current_date_in_unix * 1000,
              this.timeZone
            ).startOf("day");
            // Remove timing if it is in the past or for delivery if the window start time is before the pickup + turnAroundTime
            if (
              changeDateAndTimeZone(currentDate, timing?.startTime, this.timeZone) >=
                minTimeWithTurnAround &&
              (this.isMaxStopsAvailable(updatedTimings) ||
                this.isOrderDeliveryLastScheduledStop(
                  updatedTimings,
                  currentOrderDelivery
                ))
            ) {
              return {
                ...updatedTimings,
                day,
              };
            } else {
              return null;
            }
          }
          return {
            ...updatedTimings,
            day,
          };
        })
        ?.filter((item) => item?.id);
    } else {
      return [];
    }
  }

  shouldUpdateDayWiseWindows(dayWiseWindows) {
    return (
      (dayWiseWindows.length || this.currentDayWiseWindows.length) &&
      JSON.stringify(sortBy(dayWiseWindows, ["day"])) !==
        JSON.stringify(sortBy(this.currentDayWiseWindows, ["day"]))
    );
  }

  isMaxStopsAvailable(timings) {
    return (
      !timings?.maxStops ||
      timings?.maxStops >
        timings?.orderDeliveriesCount + timings?.recurringSubscriptionCount
    );
  }

  isOrderDeliveryLastScheduledStop(timings, currentOrderDelivery) {
    return (
      currentOrderDelivery?.timingsId && timings.id === currentOrderDelivery?.timingsId
    );
  }
}

export default OrderDeliveryDayWiseWindowsService;
