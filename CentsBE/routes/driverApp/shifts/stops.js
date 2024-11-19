const stopsPipeline = require('../../../pipeline/driverApp/stopsPipeline');

async function getStops(req, res, next) {
    try {
        const { decodedToken } = req.locals || {};
        const { shiftTimingId } = req.params;
        const { date } = req.query;
        const output = await stopsPipeline({
            teamMemberId: decodedToken.teamMemberId,
            shiftTimingId,
            date,
        });
        res.status(200).json({
            success: true,
            timingWindow: output.timingWindow,
            originStoreId: output.storeId,
            stops: output.stops,
            storeStops: output.storeStops,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getStops;
