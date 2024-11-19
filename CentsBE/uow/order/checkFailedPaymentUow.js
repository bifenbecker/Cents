const { orderDeliveryStatuses } = require('../../constants/constants');
const OrderDelivery = require('../../models/orderDelivery');
const Order = require('../../models/orders');
const Payment = require('../../models/payment');

async function checkFailedPaymentUow(payload) {
    const { serviceOrderId, transaction } = payload;

    const order = await Order.query(transaction).withGraphJoined('[serviceOrder]').findOne({
        orderableId: serviceOrderId,
        orderableType: 'ServiceOrder',
    });

    const orderDelivery = await OrderDelivery.query(transaction)
        .where('orderId', order.id)
        .orderBy('id', 'desc')
        .first();
    const payment = await Payment.query(transaction)
        .where('orderId', order.id)
        .orderBy('id', 'desc')
        .first();

    if (
        payment &&
        !['requires_confirmation', 'succeeded', 'refunded', 'SUCCEEDED'].includes(payment.status) &&
        orderDelivery &&
        orderDelivery.status === orderDeliveryStatuses.CANCELED
    ) {
        return {
            paymentFailed: true,
            paymentStatus: payment.status,
        };
    }
    return {
        paymentFailed: false,
        paymentStatus: payment ? payment.status : null,
    };
}
module.exports = exports = checkFailedPaymentUow;
