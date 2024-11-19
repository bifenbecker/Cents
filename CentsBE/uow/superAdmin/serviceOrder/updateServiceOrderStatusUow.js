const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Use incoming payload to update the status of the ServiceOrder model.
 *
 * @param {Object} payload
 */
async function updateServiceOrderStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction } = newPayload;

        const serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                status: newPayload.status,
            })
            .findById(newPayload.serviceOrderId)
            .returning('*');

        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderStatus;
