const moment = require('moment');
const { getDeliveryWindowDisplay } = require('../../../utils/liveLink/getDeliveryWindowDisplay');
const { deliveryProviders } = require('../../../constants/constants');

const injectOnDemandWindowsToDeliveryDays = ({
    timings,
    timeZone,
    calculatedPrice,
    deliveryDays,
    storeId,
    windowsAvailableTime,
}) => {
    timings.forEach((timingsDay, dayIndex) => {
        if (timingsDay.timings?.length) {
            const { timings, day, ...timingsDayRest } = timingsDay;
            const formattedTimings = timings.map((unformattedTiming) => {
                const { startTime, endTime, ...timingRest } = unformattedTiming;
                const startHours = moment(startTime).utc().hour();
                const startMinutes = moment(startTime).utc().minutes();
                const endHours = moment(endTime).utc().hour();
                const endMinutes = moment(endTime).utc().minutes();
                const momentStartTime = moment()
                    .tz(timeZone)
                    .day(day)
                    .set({ hour: startHours, minute: startMinutes, second: 0 });
                const momentEndTime = moment()
                    .tz(timeZone)
                    .day(day)
                    .set({ hour: endHours, minute: endMinutes, second: 0 });
                const doorDashWindowAmount = 30;

                const initialWindowMomentEndTime = moment(momentStartTime).add(
                    doorDashWindowAmount,
                    'm',
                );
                const separatedTimings = [
                    {
                        key: `d${dayIndex}_0_${timingRest.id}`,
                        display: getDeliveryWindowDisplay({
                            timeZone,
                            momentStartTime,
                            momentEndTime: initialWindowMomentEndTime,
                            deliveryFeeInCents: calculatedPrice,
                        }),
                        ...timingRest,
                        startTime: momentStartTime,
                        endTime: initialWindowMomentEndTime,
                        type: deliveryProviders.DOORDASH,
                        storeId,
                    },
                ];

                let timingIndex = 0;
                while (
                    moment(separatedTimings[separatedTimings.length - 1].endTime).diff(
                        momentEndTime,
                        'minutes',
                    ) < 0
                ) {
                    timingIndex += 1;
                    const lastTiming = separatedTimings[separatedTimings.length - 1].endTime;
                    const newWindowMomentStartTime = moment(lastTiming);
                    const newWindowMomentEndTime = moment(lastTiming).add(
                        doorDashWindowAmount,
                        'm',
                    );

                    const display = getDeliveryWindowDisplay({
                        timeZone,
                        momentStartTime: newWindowMomentStartTime,
                        momentEndTime: newWindowMomentEndTime,
                        deliveryFeeInCents: calculatedPrice,
                    });

                    const newTiming = {
                        key: `d${dayIndex}_${timingIndex}_${timingRest.id}`,
                        display,
                        ...timingRest,
                        startTime: newWindowMomentStartTime,
                        endTime: newWindowMomentEndTime,
                        type: deliveryProviders.DOORDASH,
                        storeId,
                    };

                    separatedTimings.push(newTiming);
                }
                const filteredTimings = separatedTimings.filter(({ startTime }) => {
                    const currentTime = moment(windowsAvailableTime).tz(timeZone);
                    const diffInMins = moment(startTime).diff(currentTime, 'minutes');
                    const isAvailableByTime = diffInMins >= 0;
                    return isAvailableByTime;
                });
                return filteredTimings;
            });
            const deliveryDayIndex = deliveryDays.findIndex(
                ({ dayOfWeek }) => Number(dayOfWeek) === day,
            );
            deliveryDays[deliveryDayIndex].onDemandDelivery = formattedTimings.flat();
            return {
                ...timingsDayRest,
                day,
                timings: formattedTimings.flat(),
            };
        }
        return timingsDay;
    });
};

module.exports = { injectOnDemandWindowsToDeliveryDays };
