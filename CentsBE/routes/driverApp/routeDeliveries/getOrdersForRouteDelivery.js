const LoggerHandler = require('../../../LoggerHandler/LoggerHandler');
const getOrdersForRouteDeliveryPipeline = require('../../../pipeline/driverApp/routeDeliveries/getOrdersForRouteDeliveryPipeline');

module.exports = async function getOrdersForRouteDelivery(req, res, next) {
    try {
        const { routeDeliveryId } = req.params;
        const { decodedToken } = req.locals;

        const result = await getOrdersForRouteDeliveryPipeline({
            routeDeliveryId,
            driverId: decodedToken.teamMemberId,
        });

        res.json({
            success: true,
            deliveryOrders: result.deliveryOrders,
            pickupOrders: result.pickupOrders,
        });
    } catch (error) {
        LoggerHandler('error', error, req);
        next(error);
    }
};
