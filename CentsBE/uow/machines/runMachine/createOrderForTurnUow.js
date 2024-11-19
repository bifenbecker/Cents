const ServiceOrderTurn = require('../../../models/serviceOrderTurn');
const Order = require('../../../models/orders');
const { ORDERABLE_TYPES, serviceTypes } = require('../../../constants/constants');

async function createServiceOrderTurns(payload) {
    const { serviceOrderId, transaction, serviceType, turnId } = payload;
    if (serviceType === serviceTypes.FULL_SERVICE) {
        await ServiceOrderTurn.query(transaction).insert({
            serviceOrderId,
            turnId,
        });
    }
    return payload;
}

async function createOrderForTurn(payload) {
    const { turnId, transaction, machineDetails } = payload;
    const order = await Order.query(transaction).insert({
        storeId: machineDetails.storeId,
        orderableType: ORDERABLE_TYPES.TURN,
        orderableId: turnId,
    });
    const newPayload = payload;
    newPayload.orderId = order.id;
    return newPayload;
}

module.exports = {
    createServiceOrderTurns,
    createOrderForTurn,
};
