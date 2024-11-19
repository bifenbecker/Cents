const ServiceOrder = require('../../models/serviceOrders');

const resetNetOrderTotalForCancelledDelivery = async (payload) => {
    const newPayload = payload;
    const { transaction, serviceOrder, refundableAmount } = newPayload;

    const netOrderTotal = Number((serviceOrder.netOrderTotal - refundableAmount).toFixed(2));
    const serviceOrderDetails = await ServiceOrder.query(transaction)
        .patch({
            netOrderTotal,
        })
        .findById(serviceOrder.id)
        .returning('*');
    newPayload.serviceOrder = serviceOrderDetails;
    return newPayload;
};

module.exports = exports = resetNetOrderTotalForCancelledDelivery;
