const ServiceOrder = require('../../../models/serviceOrders');

async function updateServiceOrder(payload) {
    try {
        const newPayload = payload;
        const { rack, notes, status, transaction, serviceOrderId } = payload;
        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .findById(serviceOrderId)
            .patch({
                rack,
                notes,
                status,
            })
            .returning('*');
        newPayload.serviceOrder = updatedServiceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = updateServiceOrder;
