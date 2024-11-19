const routeCompletePipeLine = require('../../../pipeline/driverApp/route/completeRoutePipeline');

async function routeCompleteHandler(req, res, next) {
    try {
        const { routeId } = req.params;
        const { decodedToken } = req.locals;
        const payload = {
            routeId,
            driverId: decodedToken.teamMemberId,
        };
        const route = await routeCompletePipeLine(payload);
        res.send({
            success: true,
            route,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = routeCompleteHandler;
