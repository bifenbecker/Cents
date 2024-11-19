const Shift = require('../../models/shifts');
const Timing = require('../../models/timings');

async function removeShiftWindow(payload) {
    const { shiftId } = payload;

    const deleteShift = Shift.query()
        .patch({
            deletedAt: new Date().toISOString(),
        })
        .findById(shiftId);
    const deleteTiming = Timing.query()
        .patch({
            isActive: false,
        })
        .where('shiftId', '=', shiftId);

    return Promise.all([deleteShift, deleteTiming]);
}

module.exports = removeShiftWindow;
