const RouteDelivery = require('../../../models/routeDeliveries');
const completePickupOrderPipeline = require('../../../pipeline/driverApp/completePickupOrderPipeline');
const completeDeliveryOrderPipeline = require('../../../pipeline/driverApp/completeDeliveryOrderPipeline');
const { origins, statuses } = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

async function completePickupandDeliveryOrder(req, res, next) {
    try {
        const { decodedToken } = req.locals;
        const { routeDeliveryId } = req.params;

        const routeDelivery = await RouteDelivery.query()
            .withGraphJoined('[orderDelivery.order.serviceOrder.storeCustomer]', { minimize: true })
            .findById(routeDeliveryId)
            .returning('*');

        const payload = {
            driverId: decodedToken.teamMemberId,
            ...req.body,
            routeDeliveryId,
            routeDelivery,
            origin: origins.DRIVER_APP,
        };
        let result = {};
        if (routeDelivery.orderDelivery.type === 'PICKUP') {
            result = await completePickupOrderPipeline(payload);
        } else {
            result = await completeDeliveryOrderPipeline(payload);
        }
        if (result.serviceOrder && [statuses.COMPLETED].includes(result.serviceOrder.status)) {
            eventEmitter.emit('indexCustomer', result.serviceOrder.storeCustomerId);
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = completePickupandDeliveryOrder;
