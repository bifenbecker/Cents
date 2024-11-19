const eventEmitter = require('../../../config/eventEmitter');
const { origins, statuses } = require('../../../constants/constants');
const OrderDelivery = require('../../../models/orderDelivery');
const cancelDeliveryOrder = require('../../../pipeline/driverApp/cancelDeliveryOrderPipeline');
const cancelPickupOrder = require('../../../pipeline/driverApp/cancelPickupOrderPipeline');

async function cancelOrderDelivery(req, res, next) {
    try {
        const { decodedToken } = req.locals;
        const payload = {
            userId: decodedToken.id,
            driverId: decodedToken.teamMemberId,
            ...req.body,
            ...req.params,
            origin: origins.DRIVER_APP,
        };
        const orderDelivery = await OrderDelivery.query().findById(payload.id);
        let result = {};
        if (orderDelivery.type === 'PICKUP') {
            result = await cancelPickupOrder(payload);
        } else {
            result = await cancelDeliveryOrder(payload);
        }
        if (result.serviceOrder && statuses.CANCELLED === result.serviceOrder.status) {
            eventEmitter.emit('indexCustomer', result.serviceOrder.storeCustomerId);
        }
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = cancelOrderDelivery;
