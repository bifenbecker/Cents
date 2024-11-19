const ServiceOrder = require('../../models/serviceOrders');
const { returnMethods } = require('../../constants/constants');

async function updateOrderReturnMethod(payload) {
    try {
        const { serviceOrderId, returnMethod, transaction } = payload;
        if (!returnMethod) {
            return payload;
        }
        const newPayload = payload;
        if (!Object.values(returnMethods).includes(returnMethod)) {
            throw new Error('INVALID_METHOD');
        }
        const serviceOrder = await ServiceOrder.query(transaction)
            .patch({
                returnMethod,
            })
            .findById(serviceOrderId)
            .returning('*');
        newPayload.serviceOrder = serviceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = updateOrderReturnMethod;
