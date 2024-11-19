const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const getRouteDetailsPipeline = require('../../../pipeline/driverApp/route/getRoutePipeline');

async function getRouteDetails(req, res, next) {
    try {
        const { routeId } = req.params;
        const result = await getRouteDetailsPipeline(routeId);
        res.send({
            success: true,
            route: result,
        });
    } catch (err) {
        LoggerHandler('error', err, req);
        next(err);
    }
}

module.exports = getRouteDetails;
