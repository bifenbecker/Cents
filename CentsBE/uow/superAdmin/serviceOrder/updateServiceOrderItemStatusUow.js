const ServiceOrderItem = require('../../../models/serviceOrderItem');

/**
 * Use incoming payload to update the status of the ServiceOrderItem model.
 *
 * @param {Object} payload
 */
async function updateServiceOrderItemStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const serviceOrderItems = await ServiceOrderItem.query(transaction)
            .patch({
                status: newPayload.serviceOrder.status,
            })
            .where({
                orderId: newPayload.serviceOrder.id,
            })
            .returning('*');

        newPayload.serviceOrderItems = serviceOrderItems;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderItemStatus;
