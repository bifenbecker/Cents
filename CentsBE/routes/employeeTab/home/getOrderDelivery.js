const ServiceOrder = require('../../../models/serviceOrders');

async function getOrderDeliveryDetails(req, res, next) {
    try {
        const { orderId } = req.params;
        const order = await ServiceOrder.query()
            .where(`${ServiceOrder.tableName}.id`, orderId)
            .withGraphJoined('[store.[settings], order as orderMaster.[pickup,delivery]]')
            .first();
        const deliveryWindow = { pickup: null, delivery: null };
        if (order.orderMaster.pickup) {
            deliveryWindow.pickup = order.orderMaster.pickup.deliveryWindow
                ? order.orderMaster.pickup.deliveryWindow
                : null;
        }
        if (order.orderMaster.delivery) {
            deliveryWindow.delivery = order.orderMaster.delivery.deliveryWindow
                ? order.orderMaster.delivery.deliveryWindow
                : null;
        }
        const { timeZone } = order.store.settings;
        res.status(200).json({
            success: true,
            timeZone,
            ...deliveryWindow,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = exports = getOrderDeliveryDetails;
