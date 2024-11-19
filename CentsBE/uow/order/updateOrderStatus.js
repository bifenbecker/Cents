const ServiceOrder = require('../../models/serviceOrders');

async function updateOrderStatus(payload) {
    try {
        const { serviceOrderId, status, paymentStatus, transaction } = payload;
        const newPayload = payload;
        const serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                status,
                paymentStatus,
            })
            .findById(serviceOrderId)
            .returning('*');
        newPayload.serviceOrder = serviceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = updateOrderStatus;
