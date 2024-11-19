const ShiftTiming = require('../../models/timings');

async function shiftTimings(shiftId) {
    try {
        const allTimings = await ShiftTiming.query().where('shiftId', '=', shiftId);
        return allTimings.map((timing) => timing.id);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = shiftTimings;
