const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');

async function setPickupAndDeliveryFee(payload) {
    const { orderId } = payload;
    if (!orderId) {
        return payload;
    }
    const order = await Order.query().select('orderableId', 'orderableType').findById(orderId);
    if (order.orderableType === 'ServiceOrder') {
        const serviceOrder = await ServiceOrder.query()
            .select(
                'pickupDeliveryFee',
                'pickupDeliveryTip',
                'returnDeliveryTip',
                'returnDeliveryFee',
            )
            .findById(order.orderableId);
        return { ...serviceOrder, ...payload };
    }
    return payload;
}

module.exports = setPickupAndDeliveryFee;
