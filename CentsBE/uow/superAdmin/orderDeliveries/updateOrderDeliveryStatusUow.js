const OrderDelivery = require('../../../models/orderDelivery');

/**
 * Use incoming payload to update the status of the OrderDelivery model.
 *
 * @param {Object} payload
 */
async function updateOrderDeliveryStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, status, orderDelivery } = newPayload;

        const updatedOrderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status,
                cancellationReason: status === 'CANCELED' ? 'INTERNAL_MANAGER_CANCELLATION' : null,
                deliveredAt: status === 'COMPLETED' ? new Date().toISOString() : null,
            })
            .findById(orderDelivery.id)
            .returning('*');

        newPayload.updatedOrderDelivery = updatedOrderDelivery;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateOrderDeliveryStatus;
