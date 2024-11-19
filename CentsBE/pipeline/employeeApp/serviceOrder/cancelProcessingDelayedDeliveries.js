const Pipeline = require('../../pipeline');

// uow
const updateOrderReturnMethod = require('../../../uow/order/updateReturnMethod');
const adjustServiceOrderCalculationsUow = require('../../../uow/liveLink/serviceOrders/adjustServiceOrderCalculationsUow');
const cancelOrderDeliveryUow = require('../../../uow/delivery/cancel/cancelOrderDeliveryUow');
const updateOnlineOrderPaymentIntent = require('../../../uow/liveLink/serviceOrders/updateOnlineOrderPaymentIntent');

async function cancelProcessingDelayedDeliveries(payload) {
    payload.serviceOrder.returnDeliveryFee = 0;
    payload.serviceOrder.returnDeliveryTip = 0;
    const cancelProcessingDelayedDeliveries = new Pipeline([
        updateOrderReturnMethod,
        cancelOrderDeliveryUow,
        adjustServiceOrderCalculationsUow,
        updateOnlineOrderPaymentIntent,
    ]);
    const result = await cancelProcessingDelayedDeliveries.run(payload);
    return result;
}

module.exports = exports = cancelProcessingDelayedDeliveries;
