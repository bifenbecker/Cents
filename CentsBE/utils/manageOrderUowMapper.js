const {
    canUpdateNotesAndPreferences,
    canRescheduleIntentCreatedReturnDelivery,
    canRescheduleScheduledReturnDelivery,
    canModifyPickup,
    canModifyReturn,
    canCreateDeliveryIntent,
    canCancelIntentCreatedDelivery,
    canCancelScheduledReturnDelivery,
    canCreateScheduledDelivery,
    canCancelPickup,
    canUpdateSubscription,
    canRecreateOrderItems,
} = require('./canUpdateOrderDelivery');

const cancelOrderDeliveryUow = require('../uow/delivery/cancel/cancelOrderDeliveryUow');
const cancelPickupUow = require('../uow/liveLink/serviceOrders/pickup/cancelPickupUow');
const createPickupDoordashDelivery = require('../uow/liveLink/serviceOrders/pickup/createPickupDoordashDelivery');
const createOrUpdateReturnOrderDeliveryUow = require('../uow/liveLink/serviceOrders/createOrUpdateReturnOrderDeliveryUow');
const updatePickupOrderDeliveryUow = require('../uow/liveLink/serviceOrders/updatePickupOrderDeliveryUow');
const adjustServiceOrderCalculationsUow = require('../uow/liveLink/serviceOrders/adjustServiceOrderCalculationsUow');
const partialRefundPaymentUow = require('../uow/liveLink/serviceOrders/partialRefundPaymentUow');
const createReturnDoordashDelivery = require('../uow/liveLink/serviceOrders/delivery/createReturnDoordashDelivery');
const revertServiceOrderDeliveryStatusUow = require('../uow/delivery/cancel/revertServiceOrderDeliveryStatusUow');
const updateNotesUow = require('../uow/liveLink/serviceOrders/updateNotesUow');
const createRefundModel = require('../uow/refunds/createRefundModelUow');
const determinePaymentAction = require('../uow/delivery/dropoff/determinePaymentActionUow');
const createStripePaymentIntent = require('../uow/delivery/dropoff/createStripePaymentIntentUow');
const updateReturnMethod = require('../uow/order/updateReturnMethod');
const captureStripePaymentIntent = require('../uow/delivery/dropoff/captureStripePaymentIntentUow');
const updatePayment = require('../uow/delivery/dropoff/updatePaymentUow');
const addCreditHistory = require('../uow/liveLink/serviceOrders/addCreditHistory');
const updateBalanceDueAndPaymentStatus = require('../uow/liveLink/serviceOrders/updateBalanceDueAndPaymentStatus');
const updateOrderStatus = require('../uow/liveLink/serviceOrders/updateOrderStatus');
const updatePaymentIntentPaymentMethod = require('../uow/order/updatePaymentIntentPaymentMethod');
const updateServiceOrderBags = require('../uow/driverApp/updateServiceorderBagsUOW');
const deleteDeliveryOrderActivityLog = require('../uow/delivery/cancel/deleteDeliveryOrderActivityLogUow');
const updateStripePaymentIntentUow = require('../uow/delivery/dropoff/updateStripePaymentIntentUow');
const issueCreditsInPrePayForCancelDeliveryIntentUow = require('../uow/liveLink/serviceOrders/issueCreditsInPrePayForCancelDeliveryIntentUow');
const updateSubscription = require('../uow/liveLink/serviceOrders/updateSubscriptionUow');
const createServiceOrderItems = require('../uow/order/createServiceOrderItems');
const deleteOrderItemsUow = require('../uow/liveLink/serviceOrders/deleteOrderItemsUow');
const updateServiceOrderSubscriptionUow = require('../uow/liveLink/serviceOrders/updateServiceOrderSubscriptionUow');
const deliverableServicePriceAndModifierUow = require('../uow/order/deliverableServicePriceAndModifierUow');
const getServiceOrderRecurringSubscription = require('../uow/order/serviceOrder/getServiceOrderRecurringSubscription');
const calculateRecurringDiscount = require('../uow/order/serviceOrder/calculateRecurringDiscount');
const savePaymentMethodForSubscription = require('../uow/delivery/onlineOrder/savePaymentMethodForSubscription');
const { createStripeCustomer } = require('../uow/delivery/dropoff/createStripeCustomerUow');
const definePaymentStatusAndBalanceDue = require('../uow/liveLink/serviceOrders/definePaymentStatusAndBalanceDueUow');

const getDeliveryFeeDifference = (payload, type) => {
    let deliveryFeeDifference = 0;

    if (type === 'scheduleReturn') {
        const newDeliveryFee = Number(Number(payload.returnPayload.totalDeliveryCost).toFixed(2));
        const newCourierTip = Number(Number(payload.returnPayload.courierTip).toFixed(2));
        deliveryFeeDifference = Number((newDeliveryFee + newCourierTip).toFixed(2));
    } else if (type === 'rescheduleReturn') {
        const oldDeliveryFee = Number(Number(payload.deliveryDetails.totalDeliveryCost).toFixed(2));
        const newDeliveryFee = Number(Number(payload.returnPayload.totalDeliveryCost).toFixed(2));
        const oldCourierTip = Number(Number(payload.deliveryDetails.courierTip).toFixed(2));
        const newCourierTip = Number(Number(payload.returnPayload.courierTip).toFixed(2));
        deliveryFeeDifference =
            Number((newDeliveryFee + newCourierTip).toFixed(2)) - (oldDeliveryFee + oldCourierTip);
    } else if (type === 'cancelReturn') {
        const oldDeliveryFee = Number(Number(payload.deliveryDetails.totalDeliveryCost).toFixed(2));
        const oldCourierTip = Number(Number(payload.deliveryDetails.courierTip).toFixed(2));
        deliveryFeeDifference = -Number((oldDeliveryFee + oldCourierTip).toFixed(2));
    } else if (type === 'deliveryIntent') {
        const newDeliveryFee = Number(Number(payload.returnPayload.totalDeliveryCost).toFixed(2));
        const newCourierTip = Number(Number(payload.returnPayload.courierTip).toFixed(2));
        deliveryFeeDifference = Number((newDeliveryFee + newCourierTip).toFixed(2));
    }
    return deliveryFeeDifference;
};

const manageOrderUowMapper = (payload) => {
    const uows = [];
    const { serviceOrder } = payload;

    // notes and preferences
    if (canUpdateNotesAndPreferences(payload)) {
        uows.push(updateNotesUow);
    }

    if (canUpdateSubscription(payload)) {
        uows.push(updateSubscription, updateServiceOrderSubscriptionUow);
    }

    if (payload.paymentToken) {
        uows.push(getServiceOrderRecurringSubscription);
        uows.push(savePaymentMethodForSubscription);
    }
    // pickup delivery
    if (canModifyPickup(payload)) {
        if (canCancelPickup(payload)) {
            payload.pickupPayload = {
                ...payload.pickupPayload,
                totalDeliveryCost: 0,
                courierTip: 0,
            };
            uows.push(cancelPickupUow);
        } else {
            uows.push(
                updatePickupOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
                createPickupDoordashDelivery,
            );
        }
    }

    // return delivery
    if (canModifyReturn(payload)) {
        if (canCreateDeliveryIntent(payload)) {
            const deliveryFeeDifference = getDeliveryFeeDifference(payload, 'scheduleReturn');
            payload.chargableAmount = payload.serviceOrder.isOnline
                ? deliveryFeeDifference
                : Number((payload.serviceOrder.balanceDue + deliveryFeeDifference).toFixed(2));

            uows.push(
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
                createStripeCustomer,
                determinePaymentAction,
                createStripePaymentIntent,
                updateStripePaymentIntentUow,
            );
        } else if (canRescheduleIntentCreatedReturnDelivery(payload)) {
            uows.push(
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
            );
        } else if (canRescheduleScheduledReturnDelivery(payload)) {
            uows.push(
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
                createReturnDoordashDelivery,
            );

            const deliveryFeeDifference = getDeliveryFeeDifference(payload, 'rescheduleReturn');
            payload.deliveryFeeDifference = deliveryFeeDifference;
            payload.chargableAmount = deliveryFeeDifference;
            payload.balanceDue = 0;
            payload.paymentStatus = 'PAID';

            if (deliveryFeeDifference >= 0.5) {
                uows.push(
                    createStripeCustomer,
                    determinePaymentAction,
                    createStripePaymentIntent,
                    updateStripePaymentIntentUow,
                    captureStripePaymentIntent,
                    updatePayment,
                    updateBalanceDueAndPaymentStatus,
                );
            } else if (deliveryFeeDifference <= -0.5) {
                payload.deliveryFeeDifference = Math.abs(deliveryFeeDifference);
                payload.refundableAmount = Math.abs(deliveryFeeDifference);
                uows.push(
                    partialRefundPaymentUow,
                    createRefundModel,
                    updateBalanceDueAndPaymentStatus,
                );
            } else if (
                deliveryFeeDifference > -0.5 &&
                deliveryFeeDifference < 0.5 &&
                deliveryFeeDifference !== 0
            ) {
                payload.amount = deliveryFeeDifference;
                uows.push(addCreditHistory);
            }
            uows.push(updateOrderStatus);
        } else if (canCreateScheduledDelivery(payload)) {
            const deliveryFeeDifference = getDeliveryFeeDifference(payload, 'scheduleReturn');
            const balanceDue = payload.serviceOrder.balanceDue || 0;
            payload.chargableAmount = Number((balanceDue + deliveryFeeDifference).toFixed(2));

            uows.push(
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
                determinePaymentAction,
                createStripeCustomer,
                createStripePaymentIntent,
                updateStripePaymentIntentUow,
                captureStripePaymentIntent,
                updatePayment,
                createReturnDoordashDelivery,
                definePaymentStatusAndBalanceDue,
                updateBalanceDueAndPaymentStatus,
                updateOrderStatus,
            );
        } else if (canCancelIntentCreatedDelivery(payload)) {
            payload.returnPayload = {
                ...payload.returnPayload,
                totalDeliveryCost: 0,
                courierTip: 0,
            };
            payload.orderDeliveryId = payload.returnPayload.id;
            uows.push(
                cancelOrderDeliveryUow,
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
            );

            const deliveryFeeDifference = getDeliveryFeeDifference(payload, 'cancelReturn');

            payload.amount = Math.abs(deliveryFeeDifference);

            uows.push(issueCreditsInPrePayForCancelDeliveryIntentUow);
        } else if (canCancelScheduledReturnDelivery(payload)) {
            payload.returnPayload = {
                ...payload.returnPayload,
                totalDeliveryCost: 0,
                courierTip: 0,
            };
            payload.orderDeliveryId = payload.returnPayload.id;
            uows.push(
                cancelOrderDeliveryUow,
                createOrUpdateReturnOrderDeliveryUow,
                getServiceOrderRecurringSubscription,
                calculateRecurringDiscount,
                adjustServiceOrderCalculationsUow,
            );

            const deliveryFeeDifference = getDeliveryFeeDifference(payload, 'cancelReturn');
            payload.deliveryFeeDifference = deliveryFeeDifference;
            payload.balanceDue = 0;
            payload.paymentStatus = 'PAID';
            payload.amount = Math.abs(deliveryFeeDifference);

            if (deliveryFeeDifference <= -0.5) {
                payload.deliveryFeeDifference = Math.abs(deliveryFeeDifference);
                payload.refundableAmount = Math.abs(deliveryFeeDifference);
                uows.push(
                    partialRefundPaymentUow,
                    createRefundModel,
                    updateBalanceDueAndPaymentStatus,
                );
            } else if (
                deliveryFeeDifference > -0.5 &&
                deliveryFeeDifference < 0.5 &&
                deliveryFeeDifference !== 0
            ) {
                uows.push(addCreditHistory);
            }
            uows.push(
                revertServiceOrderDeliveryStatusUow,
                updateServiceOrderBags,
                deleteDeliveryOrderActivityLog,
            );
        }
    }

    // update return Method
    if (payload.returnMethod) {
        uows.push(updateReturnMethod);
    }

    // update payment token only if order is not paid
    if (serviceOrder.paymentStatus !== 'PAID' || Number(serviceOrder.balanceDue) !== 0) {
        uows.push(updatePaymentIntentPaymentMethod);
    }

    // Recreate order items
    if (canRecreateOrderItems(payload)) {
        uows.push(
            deleteOrderItemsUow,
            deliverableServicePriceAndModifierUow,
            createServiceOrderItems,
        );
    }
    return uows;
};

module.exports = exports = manageOrderUowMapper;
