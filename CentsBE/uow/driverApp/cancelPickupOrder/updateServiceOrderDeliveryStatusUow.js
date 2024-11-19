const ServiceOrder = require('../../../models/serviceOrders');
const { statuses } = require('../../../constants/constants');

/**
 * Mark the ServiceOrder as to "CANCELLED"
 *
 * @param {Object} payload
 */
async function updateServiceOrderDeliveryStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
            .patch({
                status: statuses.CANCELLED,
                returnMethod: null,
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderDeliveryStatus;
