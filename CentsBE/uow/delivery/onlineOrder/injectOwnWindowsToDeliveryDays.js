const moment = require('moment');
const getStandardDeliveryWindows = require('../../liveLink/store/getOwnDriverDeliverySettings/getStandardDeliveryWindows');
const { getDeliveryWindowDisplay } = require('../../../utils/liveLink/getDeliveryWindowDisplay');
const { deliveryProviders } = require('../../../constants/constants');

async function injectOwnWindowsToDeliveryDays(payload) {
    const {
        timeZone,
        bufferTimeInHours,
        deliveryFeeInCents,
        deliveryDays,
        storeId,
        startDate: windowsAvailableTime,
    } = payload;
    const availableTimingsByDay = await getStandardDeliveryWindows(payload);
    const currentTime = moment(windowsAvailableTime).tz(timeZone);
    let isHaveAvailableTimings = false;
    availableTimingsByDay.forEach((timingsDay, dayIndex) => {
        if (timingsDay.timings?.length) {
            const { timings, day } = timingsDay;
            const formattedTimings = timings.map((unformattedTiming, timingIndex) => {
                const { startTime, endTime, ...timingRest } = unformattedTiming;
                const startHours = moment(startTime).utc().hour();
                const startMinutes = moment(startTime).utc().minutes();

                const endHours = moment(endTime).utc().hour();
                const endMinutes = moment(endTime).utc().minutes();
                const currentWeekDay =
                    currentTime.isoWeekday() === 7 ? 0 : currentTime.isoWeekday();
                const isEarlierWeekDay = currentWeekDay > day;
                const momentStartTime = moment(windowsAvailableTime)
                    .tz(timeZone)
                    .add(isEarlierWeekDay ? 1 : 0, 'w')
                    .day(day)
                    .set({ hour: startHours, minute: startMinutes, second: 0 });
                const momentEndTime = moment(windowsAvailableTime)
                    .tz(timeZone)
                    .add(isEarlierWeekDay ? 1 : 0, 'w')
                    .day(day)
                    .set({ hour: endHours, minute: endMinutes, second: 0 });

                const oneWayFee = (deliveryFeeInCents / 2).toFixed(2);
                const display = getDeliveryWindowDisplay({
                    timeZone,
                    momentStartTime,
                    momentEndTime,
                    deliveryFeeInCents: oneWayFee,
                });
                const formattedTiming = {
                    key: `o${dayIndex}_${timingIndex}_${timingRest.id}`,
                    display,
                    ...timingRest,
                    startTime: momentStartTime,
                    endTime: momentEndTime,
                    deliveryFeeInCents: oneWayFee,
                    type: deliveryProviders.OWN_DRIVER,
                    storeId,
                };
                return formattedTiming;
            });

            const filteredTimings = formattedTimings.filter((timing) => {
                const { startTime, maxStops, orderDeliveriesCount, recurringSubscriptionCount } =
                    timing;
                const diffInMins = moment(startTime).diff(
                    windowsAvailableTime || currentTime,
                    'minutes',
                );
                const isAvailableByTime = diffInMins > bufferTimeInHours * 60;
                const existingOrders = orderDeliveriesCount + recurringSubscriptionCount;
                const isAvailableByStops = existingOrders < maxStops || maxStops === null;
                const isAvailable = isAvailableByTime && isAvailableByStops;
                if (!isHaveAvailableTimings && isAvailable) {
                    isHaveAvailableTimings = true;
                }
                return isAvailableByTime && isAvailableByStops;
            });

            const sortedTimings = filteredTimings.sort(
                ({ startTime: firstStartTime }, { startTime: secondStartTime }) =>
                    secondStartTime.valueOf() - firstStartTime.valueOf(),
            );

            const deliveryDayIndex = deliveryDays.findIndex(
                ({ dayOfWeek }) => dayOfWeek === Number(timingsDay?.day),
            );
            if (deliveryDayIndex > -1) {
                deliveryDays[deliveryDayIndex].ownDelivery = sortedTimings;
            }
        }
    });
}

module.exports = { injectOwnWindowsToDeliveryDays };
