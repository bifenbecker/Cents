const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const getRouteDeliveryInfoPipeline = require('../../../pipeline/driverApp/routeDeliveries/getRouteDeliveryInfoPipeline');

module.exports = async function getRouteDeliveryInfo(req, res, next) {
    try {
        const { routeDeliveryId } = req.params;
        const { decodedToken } = req.locals;

        const result = await getRouteDeliveryInfoPipeline({
            routeDeliveryId,
            driverId: decodedToken.teamMemberId,
        });

        res.json({
            success: true,
            routeDelivery: result.routeDeliveries.find((r) => r.id === +routeDeliveryId),
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        next(error);
    }
};
