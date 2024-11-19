const cancelThePickupRouteDeliveryPipeline = require('../../../pipeline/driverApp/routeDeliveries/cancelThePickupRouteDeliveryPipeline');
const cancelTheDeliveryRouteDeliveryPipeline = require('../../../pipeline/driverApp/routeDeliveries/cancelTheDeliveryRouteDeliveryPipeline');
const RouteDelivery = require('../../../models/routeDeliveries');
const { routeDeliveryStatuses, origins, statuses } = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

module.exports = async function cancelTheRouteDelivery(req, res, next) {
    try {
        const { routeDeliveryId } = req.params;
        const { teamMemberId } = req.locals.decodedToken;
        const { reason: cancellationReason } = req.body;

        const routeDelivery = await RouteDelivery.query()
            .withGraphJoined('[orderDelivery.order.serviceOrder.storeCustomer]', { minimize: true })
            .findById(routeDeliveryId)
            .where('routeDeliveries.routableType', 'OrderDelivery')
            .whereNotIn('routeDeliveries.status', [
                routeDeliveryStatuses.COMPLETED,
                routeDeliveryStatuses.PICKED_UP,
            ]);

        if (!routeDelivery || !routeDelivery.orderDelivery) {
            throw new Error('Route Delivery Not Found');
        }

        if (routeDelivery.status === routeDeliveryStatuses.CANCELED) {
            throw new Error('Route Delivery Already Canceled');
        }

        let result = {};

        if (routeDelivery.orderDelivery.type === 'PICKUP') {
            result = await cancelThePickupRouteDeliveryPipeline({
                driverId: teamMemberId,
                routeDelivery,
                cancellationReason,
                origin: origins.DRIVER_APP,
            });
        } else {
            result = await cancelTheDeliveryRouteDeliveryPipeline({
                driverId: teamMemberId,
                routeDelivery,
                cancellationReason,
            });
        }
        if (result.serviceOrder && statuses.CANCELLED) {
            eventEmitter.emit('indexCustomer', result.serviceOrder.storeCustomerId);
        }

        res.json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
};
