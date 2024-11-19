const Order = require('../../../models/orders');
const OrderDelivery = require('../../../models/orderDelivery');
const ServiceOrder = require('../../../models/serviceOrders');
const { ORDER_DELIVERY_TYPES } = require('../../../constants/constants');

/**
 * Use incoming payload to update the existing OrderDelivey model.
 *
 * @param {Object} payload
 */
async function updateOrderDelivery(payload) {
    try {
        const newPayload = payload;
        const { transaction, status, thirdPartyDeliveryCostInCents, subsidyInCents } = newPayload;

        const orderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status,
                totalDeliveryCost: newPayload.newTotalDeliveryCost,
                deliveredAt: status === 'COMPLETED' ? new Date().toISOString() : null,
                thirdPartyDeliveryCostInCents,
                subsidyInCents,
            })
            .findById(newPayload.orderDelivery.id)
            .returning('*');
        const order = await Order.query(transaction).findById(orderDelivery.orderId);
        const serviceOrder = await ServiceOrder.query(transaction).findById(order.orderableId);
        if (orderDelivery.type === ORDER_DELIVERY_TYPES.RETURN) {
            serviceOrder.returnDeliveryFee = orderDelivery.totalDeliveryCost;
        } else {
            serviceOrder.pickupDeliveryFee = orderDelivery.totalDeliveryCost;
        }
        newPayload.orderDelivery = orderDelivery;
        newPayload.order = order;
        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDelivery;
