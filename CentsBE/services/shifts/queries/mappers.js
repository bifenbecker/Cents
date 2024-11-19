const DeliveryTimingsSetting = require('../../../models/deliveryTimingSettings');

async function mapTimingsAccordingToDays(windows, deliveryType) {
    if (!windows.length) {
        return [];
    }
    const { currentDay, currentEpochTime } = windows[0];
    let hasAvailableTimings = false;
    const mappedTimings = [];
    for (let i = 0; i <= 6; i++) {
        const timings = windows.filter((window) => Number(window.day) === i);
        if (!hasAvailableTimings && i !== currentDay && timings.length > 0) {
            hasAvailableTimings = true;
        }
        if (!hasAvailableTimings && i === currentDay) {
            // check if currentTime falls between any interval for today.
            const availableTimeIndex = timings.findIndex(
                (timing) => timing.startEpochTime > currentEpochTime,
            );
            if (availableTimeIndex !== -1) {
                hasAvailableTimings = true;
            }
        }
        if (deliveryType === 'OWN_DRIVER') {
            const timingIds = timings.map((timing) => timing.id);
            const timingsWithMaxStopsAvailable = await DeliveryTimingsSetting.query()
                .whereIn('timingsId', timingIds)
                .groupBy('deliveryTimingSettings.id')
                .having('maxStops', '>', 0)
                .orHavingNull('maxStops');
            if (timingsWithMaxStopsAvailable.length > 0) {
                mappedTimings.push({
                    day: i,
                    timings,
                });
            }
        } else {
            mappedTimings.push({
                day: i,
                timings,
            });
        }
    }
    return hasAvailableTimings ? mappedTimings : [];
}

function mapTimings(windows) {
    if (!windows.length) {
        return [];
    }
    const mappedTimings = [];
    for (let i = 0; i <= 6; i++) {
        const timings = windows.filter((window) => Number(window.day) === i);
        mappedTimings.push({
            day: i,
            timings,
        });
    }
    return mappedTimings;
}

module.exports = exports = { mapTimingsAccordingToDays, mapTimings };
