const ServiceOrder = require('../../../models/serviceOrders');

const updateBalanceDueAndPaymentStatus = async (payload) => {
    const { transaction, balanceDue = 0, paymentStatus = 'PAID', serviceOrderId } = payload;
    await ServiceOrder.query(transaction)
        .patch({
            balanceDue,
            paymentStatus,
        })
        .findById(serviceOrderId)
        .returning('*');

    const newPayload = payload;
    newPayload.serviceOrder.balanceDue = balanceDue;
    newPayload.serviceOrder.paymentStatus = paymentStatus;
    return newPayload;
};

module.exports = exports = updateBalanceDueAndPaymentStatus;
