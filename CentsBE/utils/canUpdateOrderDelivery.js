const { isEmpty } = require('lodash');

const Constants = require('../constants/constants');

// can update notes

function canUpdateNotesAndPreferences(payload) {
    return !payload.isIntakeComplete;
}
// pickup checks
function canModifyPickup(payload) {
    return (
        !isEmpty(payload.pickupDetails) &&
        !isEmpty(payload.pickupPayload) &&
        payload.pickupDetails.status === Constants.orderDeliveryStatuses.SCHEDULED
    );
}

function canCancelPickup(payload) {
    return payload.isPickupCancelled && !isEmpty(payload.pickupDetails);
}

// delivery checks
function canModifyReturn(payload) {
    return (
        payload.returnPayload &&
        !isEmpty(payload.returnPayload) &&
        payload.order.orderableType !== 'RESIDENTIAL'
    );
}

function canRescheduleIntentCreatedReturnDelivery(payload) {
    return (
        payload.returnPayload &&
        payload.deliveryDetails &&
        !isEmpty(payload.deliveryDetails) &&
        payload.deliveryDetails.status === Constants.orderDeliveryStatuses.INTENT_CREATED &&
        payload.returnMethod !== Constants.returnMethods.IN_STORE_PICKUP
    );
}

function canRescheduleScheduledReturnDelivery(payload) {
    return (
        payload.returnPayload &&
        payload.deliveryDetails &&
        !isEmpty(payload.deliveryDetails) &&
        payload.deliveryDetails.status === Constants.orderDeliveryStatuses.SCHEDULED &&
        payload.returnMethod !== Constants.returnMethods.IN_STORE_PICKUP
    );
}

function canCreateDeliveryIntent(payload) {
    return (
        !payload.isProcessingCompleted &&
        payload.returnPayload &&
        !payload.returnPayload.id &&
        isEmpty(payload.deliveryDetails)
    );
}

function canCancelIntentCreatedDelivery(payload) {
    return (
        payload.returnMethod === Constants.returnMethods.IN_STORE_PICKUP &&
        !payload.isProcessingCompleted &&
        payload.returnPayload.id &&
        !isEmpty(payload.deliveryDetails) &&
        payload.deliveryDetails.status === Constants.orderDeliveryStatuses.INTENT_CREATED
    );
}

function canCancelScheduledReturnDelivery(payload) {
    return (
        payload.returnMethod === Constants.returnMethods.IN_STORE_PICKUP &&
        !isEmpty(payload.deliveryDetails) &&
        payload.deliveryDetails.status === Constants.orderDeliveryStatuses.SCHEDULED
    );
}

function canCreateScheduledDelivery(payload) {
    return payload.isProcessingCompleted && !payload.returnPayload.id;
}

function canUpdateSubscription(payload) {
    return (
        payload.subscription &&
        !isEmpty(payload.subscription) &&
        payload.serviceOrder.orderType === 'ONLINE'
    );
}

function canRecreateOrderItems(payload) {
    return (
        !payload.isIntakeComplete &&
        payload.servicePriceId &&
        payload.serviceOrder.orderType === 'ONLINE'
    );
}

module.exports = exports = {
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
};
