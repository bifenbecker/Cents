const updateShiftsPipeline = require('../../../../pipeline/shifts/updateShifts');

async function updateShiftsAndTimings(req, res, next) {
    try {
        await updateShiftsPipeline({ ...req.body, storeId: req.params.storeId });

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = updateShiftsAndTimings;
