const updateOrderReturnMethod = require('../../order/updateReturnMethod');
const updateOrderStatus = require('../../order/updateOrderStatus');
const adjustServiceOrderCalculationsUow = require('../../liveLink/serviceOrders/adjustServiceOrderCalculationsUow');
const updateIntentDeliveryStatus = require('../../order/updateIntentDeliveryStatus');
const ServiceOrderQuery = require('../../../services/queries/serviceOrder');

const {
    orderSmsEvents,
    returnMethods,
    statuses,
    paymentStatuses,
} = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

/**
 * handles payment failure
 * 1. cancel the pending payemnt and stripe payment intent
 * 2. update the return method of the service order to in_store_pickup
 * 3. cancel the intent_created delivery
 * 4. update the service order calculations
 * 5. send payment failed sms to the customer
 */
async function managePaymentFailureUow(payload) {
    const { isPaymentFailed, serviceOrderId, transaction } = payload;
    if (isPaymentFailed) {
        const serviceOrderQuery = new ServiceOrderQuery(serviceOrderId, transaction);
        await serviceOrderQuery.cancelPendingPayment();
        payload.status = statuses.READY_FOR_PICKUP;
        payload.paymentStatus = paymentStatuses.BALANCE_DUE;
        payload.returnMethod = returnMethods.IN_STORE_PICKUP;
        await updateOrderStatus(payload);
        await updateOrderReturnMethod(payload);
        await updateIntentDeliveryStatus(payload);
        payload.serviceOrder.masterOrderId = payload.masterOrderId;
        await adjustServiceOrderCalculationsUow(payload);
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.ORDER_PAYMENT_FAILED,
            serviceOrderId,
        );
    }

    return payload;
}

module.exports = exports = managePaymentFailureUow;
