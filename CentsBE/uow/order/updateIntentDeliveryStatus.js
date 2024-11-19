const {
    orderDeliveryStatuses,
    orderSmsEvents,
    paymentStatuses,
} = require('../../constants/constants');
const eventEmitter = require('../../config/eventEmitter');

async function updateIntentDeliveryStatus(payload) {
    const { intentCreatedOrderDelivery, transaction, capturedPaymentIntent, serviceOrderId } =
        payload;
    if (!intentCreatedOrderDelivery) {
        return payload;
    }

    const newPayload = payload;
    let deliveryStatus;
    if (capturedPaymentIntent) {
        if (capturedPaymentIntent.status === 'failed') {
            deliveryStatus = orderDeliveryStatuses.CANCELED;
            payload.serviceOrder.returnDeliveryFee = 0;
            payload.serviceOrder.returnDeliveryTip = 0;

            // if doordash then cancel the doordash delivery
            // send sms to customer saying payment is failed
            eventEmitter.emit(
                'orderSmsNotification',
                orderSmsEvents.ORDER_PAYMENT_FAILED,
                serviceOrderId,
            );
        } else {
            deliveryStatus = orderDeliveryStatuses.SCHEDULED;
        }
    } else if (
        !capturedPaymentIntent &&
        payload.serviceOrder.paymentStatus !== paymentStatuses.PAID
    ) {
        deliveryStatus = orderDeliveryStatuses.CANCELED;
        payload.serviceOrder.returnDeliveryFee = 0;
        payload.serviceOrder.returnDeliveryTip = 0;
        // if doordash then cancel the doordash delivery
    } else {
        deliveryStatus = orderDeliveryStatuses.SCHEDULED;
    }
    newPayload.orderDelivery = await intentCreatedOrderDelivery
        .$query(transaction)
        .patch({
            status: deliveryStatus,
        })
        .returning('*');
    return newPayload;
}
module.exports = exports = updateIntentDeliveryStatus;
