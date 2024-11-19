const ServiceOrder = require('../../../models/serviceOrders');
const { returnMethods } = require('../../../constants/constants');

async function resetReturnMethod(payload) {
    try {
        const { serviceOrder, transaction } = payload;
        const newPayload = payload;
        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                returnMethod: returnMethods.IN_STORE_PICKUP,
            })
            .findById(serviceOrder.id)
            .returning('*');
        newPayload.serviceOrder = updatedServiceOrder;
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = exports = resetReturnMethod;
