const moment = require('moment');

const getGroupedShiftTimings = (shifts) => {
    const storeTimings = [];
    if (shifts.length === 0) {
        return [];
    }

    const dayWiseStoreTimings = [0, 1, 2, 3, 4, 5, 6].map((day) => {
        const shiftDayTimings = shifts
            .map(
                (shift) =>
                    shift.timings.find(
                        (timing) => parseInt(timing.day, 10) === day && timing.isActive,
                    ) || null,
            )
            .filter((t) => t);

        const startTime = shiftDayTimings.map((t) => t.startTime).sort((a, b) => a - b)[0] || null;
        const endTime = shiftDayTimings.map((t) => t.endTime).sort((a, b) => b - a)[0] || null;

        return {
            day,
            storeStartTime: startTime ? moment.utc(startTime) : null,
            storeEndTime: endTime ? moment.utc(endTime) : null,
        };
    });

    let i = 0;
    let j;

    while (i < 7) {
        const tempObj = {
            startDay: i,
            endDay: i,
            startTime: dayWiseStoreTimings[i].storeStartTime,
            endTime: dayWiseStoreTimings[i].storeEndTime,
        };
        j = i;
        while (j < 7) {
            if (
                ((!dayWiseStoreTimings[i].storeStartTime &&
                    !dayWiseStoreTimings[j].storeStartTime) ||
                    (dayWiseStoreTimings[i].storeStartTime &&
                        dayWiseStoreTimings[j].storeStartTime &&
                        dayWiseStoreTimings[i].storeStartTime.isSame(
                            dayWiseStoreTimings[j].storeStartTime,
                        ))) &&
                ((!dayWiseStoreTimings[i].storeEndTime && !dayWiseStoreTimings[j].storeEndTime) ||
                    (dayWiseStoreTimings[i].storeEndTime &&
                        dayWiseStoreTimings[j].storeEndTime &&
                        dayWiseStoreTimings[i].storeEndTime.isSame(
                            dayWiseStoreTimings[j].storeEndTime,
                        )))
            ) {
                tempObj.endDay = j;
                i = j;
                j += 1;
            } else {
                j = 7;
            }
        }
        storeTimings.push(tempObj);
        i += 1;
    }
    return storeTimings;
};

exports.getGroupedShiftTimings = getGroupedShiftTimings;
