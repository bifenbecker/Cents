const ServiceOrder = require('../../../models/serviceOrders');
const { statuses, returnMethods } = require('../../../constants/constants');

/**
 * Revert the status of the ServiceOrder to "READY_FOR_PICKUP"
 *
 * @param {Object} payload
 */
async function revertServiceOrderDeliveryStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        if (serviceOrder.status === statuses.PROCESSING) {
            return newPayload;
        }

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .withGraphFetched('[orderItems.[referenceItems.[lineItemDetail]]]')
            .patch({
                status: statuses.READY_FOR_PICKUP,
                returnMethod: returnMethods.IN_STORE_PICKUP,
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = revertServiceOrderDeliveryStatus;
