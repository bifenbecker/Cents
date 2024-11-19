const ServiceOrder = require('../../../models/serviceOrders');
const { statuses } = require('../../../constants/constants');

/**
 * update a status to 'COMPLETED' for serviceOrder
 *
 * @param {Object} payload
 */
async function UpdateServiceOrder(payload) {
    try {
        const newPayload = payload;
        const { transaction, serviceOrder } = newPayload;

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                status: statuses.COMPLETED,
                completedAt: new Date().toISOString(),
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.updatedServiceOrder = updatedServiceOrder;
        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = UpdateServiceOrder;
