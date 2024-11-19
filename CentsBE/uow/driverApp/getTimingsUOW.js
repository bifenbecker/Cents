const moment = require('moment-timezone');
const Timings = require('../../models/timings');

async function getStops(payload) {
    try {
        const { shiftTimingId, transaction, date } = payload;
        const timing = await Timings.query(transaction)
            .findById(shiftTimingId)
            .withGraphFetched('[shift.[store.[settings]]]');
        let timingWindow;
        if (timing) {
            const startTime = moment.utc(timing.startTime);
            const endTime = moment.utc(timing.endTime);
            const currentDate = moment.tz(timing.shift.store.settings.timeZone || 'UTC');
            const shiftDate = date
                ? moment.tz(date, 'MM/DD/YYYY', timing.shift.store.settings.timeZone || 'UTC')
                : currentDate.clone();

            if (currentDate.format('MM/DD/YYYY') === shiftDate.format('MM/DD/YYYY')) {
                timingWindow = `Today ${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`;
            } else {
                timingWindow = `${shiftDate.format('dddd MM/DD')} ${startTime.format(
                    'h:mm A',
                )} - ${endTime.format('h:mm A')}`;
            }
            return { ...payload, timing, timingWindow };
        }
        throw new Error('shift timing id not found');
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = getStops;
