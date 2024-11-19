const isEmpty = require('lodash/isEmpty');
const Order = require('../../../models/orders');
const Payment = require('../../../models/payment');
const ServiceOrder = require('../../../models/serviceOrders');

const definePaymentStatusAndBalanceDue = async (payload) => {
    const { transaction, serviceOrderId, serviceOrder } = payload;
    let netOrderTotal;

    if (serviceOrder && !isEmpty(serviceOrder)) {
        netOrderTotal = serviceOrder?.netOrderTotal;
    } else {
        const foundServiceOrder = await ServiceOrder.query().findById(serviceOrderId);
        netOrderTotal = foundServiceOrder?.netOrderTotal;
    }

    const order = await Order.query(transaction).findOne({
        orderableType: 'ServiceOrder',
        orderableId: serviceOrderId,
    });
    const successfulPayments = await Payment.query(transaction).where({
        status: 'succeeded',
        orderId: order.id,
    });
    const successfulPaymentTotalsArray = successfulPayments.map((payment) => payment.totalAmount);
    const totalPaid = successfulPaymentTotalsArray.reduce(
        (previous, currentItem) => previous + currentItem,
        0,
    );

    const properBalanceDue = Number(Number(netOrderTotal) - Number(totalPaid));
    const properPaymentStatus = properBalanceDue === 0 ? 'PAID' : 'BALANCE_DUE';

    const newPayload = payload;
    newPayload.balanceDue = properBalanceDue;
    newPayload.paymentStatus = properPaymentStatus;
    return newPayload;
};

module.exports = exports = definePaymentStatusAndBalanceDue;
