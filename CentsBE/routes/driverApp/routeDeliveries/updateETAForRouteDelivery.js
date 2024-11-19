const logger = require('../../../lib/logger');
const updateETAForRouteDeliveryPipeline = require('../../../pipeline/driverApp/routeDeliveries/updateETAForRouteDeliveryPipeline');

module.exports = async function updateETAForRouteDelivery(req, res, next) {
    try {
        const { decodedToken } = req.locals;
        const { routeDeliveryId } = req.params;

        const payload = {
            driverId: decodedToken.teamMemberId,
            ...req.body,
            routeDeliveryId,
        };

        const result = await updateETAForRouteDeliveryPipeline(payload);
        res.json({
            success: true,
            eta: result.formattedETA,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
