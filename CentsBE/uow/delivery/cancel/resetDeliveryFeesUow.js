const ServiceOrder = require('../../../models/serviceOrders');

/**
 * Use incoming payload to reset the delivery fees on the ServiceOrder
 *
 * @param {Object} payload
 */
async function resetDeliveryFees(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                returnDeliveryFee: 0,
                returnDeliveryTip: 0,
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = resetDeliveryFees;
