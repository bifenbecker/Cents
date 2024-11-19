const { checkTimingTimeChanged } = require('../../../helpers/dateFormatHelper');
const Timing = require('../../../models/timings');

async function fetchUpdatedTimingsUOW(payload) {
    const { timingIds, timing } = payload;

    const existingTimings = await Timing.query()
        .select('id', 'startTime', 'endTime', 'isActive')
        .whereIn('id', timingIds);
    const updatedTimingIds = timingIds
        .map((timingId) => {
            const previousTiming = existingTimings.find((t) => t.id === timingId);

            return checkTimingTimeChanged(previousTiming, timing) || !timing.isActive
                ? timingId
                : null;
        })
        .filter((id) => !!id);

    return {
        ...payload,
        updatedTimingIds,
        timingsWithDeliveriesAndSubscriptionsCount: [],
    };
}

module.exports = fetchUpdatedTimingsUOW;
