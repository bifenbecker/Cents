// models
const ServiceOrder = require('../../../models/serviceOrders');

/**
 * validates service order
 * @param {object} payload
 * @returns array of turns ids
 */

async function validateServiceOrder(payload) {
    try {
        const { transaction, serviceOrderId } = payload;
        const newPayload = payload;

        const serviceOrder = await ServiceOrder.query(transaction).findById(serviceOrderId);
        if (!serviceOrder) {
            throw new Error('Invalid serviceOrder id.');
        }
        newPayload.serviceOrder = serviceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = validateServiceOrder;
