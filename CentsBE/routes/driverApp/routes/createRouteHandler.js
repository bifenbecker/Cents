const createRoutePipeline = require('../../../pipeline/driverApp/route/createRoutePipeline');

async function createRouteHandler(req, res, next) {
    try {
        const { decodedToken } = req.locals;
        const payload = {
            driverId: decodedToken.teamMemberId,
            ...req.body,
        };
        const routeId = await createRoutePipeline(payload);
        res.status(200).json({
            success: true,
            routeId,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = createRouteHandler;
