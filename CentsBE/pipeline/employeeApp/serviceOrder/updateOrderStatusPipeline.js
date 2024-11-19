const momentTz = require('moment-timezone');
const LdClient = require('../../../launch-darkly/LaunchDarkly');
const Pipeline = require('../../pipeline');

// Uows
const updateOrderStatusUow = require('../../../uow/order/updateOrderStatusUow');
const updateIntentDeliveryStatus = require('../../../uow/order/updateIntentDeliveryStatus');
const { orderDeliveryStatuses, statuses, returnMethods } = require('../../../constants/constants');

const updateServiceOrderStatus = require('../../../uow/delivery/dropoff/updateServiceOrderStatusUow');
const determinePaymentAction = require('../../../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../../../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateStripePaymentIntent = require('../../../uow/delivery/dropoff/updateStripePaymentIntentUow');
const resetBalanceDueForDelivery = require('../../../uow/delivery/dropoff/resetBalanceDueForDeliveryUow');
const captureStripePaymentIntent = require('../../../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../../../uow/delivery/dropoff/updatePaymentUow');
const updateOrderReturnMethod = require('../../../uow/order/updateReturnMethod');
const adjustServiceOrderCalculationsUow = require('../../../uow/liveLink/serviceOrders/adjustServiceOrderCalculationsUow');
const getServiceOrderRecurringSubscription = require('../../../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../../../uow/order/serviceOrder/calculateRecurringDiscount');
const cancelPendingPayment = require('../../../uow/payment/cancelPendingPayment');
const managePaymentFailureUow = require('../../../uow/delivery/dropoff/managePaymentFailureUow');
const createDoordashDeliveryAfterPayment = require('../../../uow/delivery/dropoff/createDoordashDeliveryAfterPayment');
const updateDoordashDeliveryEstimate = require('../../../uow/delivery/doordash/updateDoordashDeliveryEstimate');

async function updateOrderStatusPipeline(payload) {
    const {
        orderBeforeUpdate: {
            order: { delivery },
            store: {
                settings: { timeZone },
            },
        },
        status,
        constants: { isOrder },
        currentStore,
    } = payload;
    const uows = [updateOrderStatusUow];
    if (
        delivery &&
        delivery.status === orderDeliveryStatuses.INTENT_CREATED &&
        status === statuses.READY_FOR_PICKUP
    ) {
        const deliveryStartTime = delivery.deliveryWindow[0];
        payload.intentCreatedOrderDelivery = delivery;
        const currentTime = momentTz().tz(timeZone).valueOf();
        const deliveryTime = momentTz(Number(deliveryStartTime)).tz(timeZone).valueOf();
        if (currentTime < deliveryTime) {
            payload.isDeliveryOrder = true;
            payload.orderDelivery = delivery;
            payload.serviceOrder = payload.isOrder;
            payload.serviceOrder.masterOrderId = payload.masterOrderId;
            payload.serviceOrderId = payload.isOrder.id;
            payload.storeDetails = currentStore;
            payload.store = currentStore;
            const subscriptionRemovalTestFlag = await LdClient.evaluateFlag(
                'subscription-removal-fix',
            );
            if (subscriptionRemovalTestFlag) {
                payload.orderItemsTotal = isOrder.orderTotal;
                payload.promotionAmount = isOrder.promotionAmount;
                uows.push(getServiceOrderRecurringSubscription, calculateRecurringDiscount);
            }
            uows.push(
                updateDoordashDeliveryEstimate,
                adjustServiceOrderCalculationsUow,
                determinePaymentAction,
                createStripePaymentIntent,
                updateStripePaymentIntent,
                captureStripePaymentIntent,
                updatePayment,
                resetBalanceDueForDelivery,
                updateIntentDeliveryStatus,
                updateServiceOrderStatus,
                managePaymentFailureUow,
                createDoordashDeliveryAfterPayment,
            );
        } else {
            payload.returnMethod = returnMethods.IN_STORE_PICKUP;
            payload.orderItemsTotal = isOrder.orderTotal;
            payload.promotionAmount = isOrder.promotionAmount;
            uows.push(
                cancelPendingPayment,
                updateOrderReturnMethod,
                updateIntentDeliveryStatus,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
            );
        }
    }
    const updateOrderStatusPipeline = new Pipeline(uows);
    const output = await updateOrderStatusPipeline.run(payload);
    return output;
}

module.exports = {
    updateOrderStatusPipeline,
};
