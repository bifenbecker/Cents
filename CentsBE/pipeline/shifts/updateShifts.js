const Pipeline = require('../pipeline');

// Uows
const initShiftUpsert = require('../../uow/store/initShiftUpsert');
const createShifts = require('../../uow/store/createShifts');
const updateShifts = require('../../uow/store/updateShifts');

async function updateShiftsPipeline(payload) {
    try {
        const updateShiftsAndTimingsPipeline = new Pipeline([
            initShiftUpsert,
            createShifts,
            updateShifts,
        ]);
        const output = await updateShiftsAndTimingsPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateShiftsPipeline;
