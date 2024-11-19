const removeShiftWindowPipeline = require('../../../../pipeline/locations/removeShiftWindowPipeline');

async function removeShiftWindow(req, res, next) {
    try {
        const { shiftId, storeId } = req.params;
        const payload = {
            storeId,
            shiftId,
        };

        await removeShiftWindowPipeline(payload);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = removeShiftWindow;
