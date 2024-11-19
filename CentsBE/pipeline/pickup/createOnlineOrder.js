const Pipeline = require('../pipeline');

// UoWs
const createOrder = require('../../uow/order/createOrder');
// const cancelUberOrder = require('../../uow/delivery/uber/cancel'); uncomment for uber.
const createServiceOrder = require('../../uow/order/createServiceOrder');
// const getUberAuthToken = require('../../uow/delivery/uber/getAuthToken'); uncomment for uber.
const updateStoreCustomerNotes = require('../../uow/customer/updateNotes');
const createStoreCustomer = require('../../uow/customer/createStoreCustomer');
// const createUberDelivery = require('../../uow/delivery/uber/createOrderDelivery');
// uncomment for uber.
const createServiceOrderItems = require('../../uow/order/createServiceOrderItems');
// const requiresUberAuthToken = require('../../uow/delivery/onlineOrder/requiresUberAuth');
// uncomment for uber.
const updateServiceOrderTotals = require('../../uow/delivery/pickup/updateServiceOrderTotals');
const createPickupOrderDelivery = require('../../uow/delivery/onlineOrder/createPickupOrderDelivery');
const createStripePaymentIntent = require('../../uow/delivery/pickup/createStripePaymentIntentUow');
const createPaymentObject = require('../../uow/delivery/pickup/createPaymentUow');
const { createStripeCustomer } = require('../../uow/delivery/dropoff/createStripeCustomerUow');
const createOrderPromoDetail = require('../../uow/order/createOrderPromoDetailUow');
const createRecurringSubscription = require('../../uow/delivery/onlineOrder/createRecurringSubscription');
const createServiceOrderBags = require('../../uow/delivery/pickup/createServiceOrderBagsUow');
const createIntentCreatedDeliveryUow = require('../../uow/liveLink/serviceOrders/delivery/createIntentCreatedDeliveryUow');
const createPickupDoorDash = require('../../uow/liveLink/serviceOrders/createPickupDoorDash');
const createServiceOrderRecurringSubscription = require('../../uow/delivery/onlineOrder/createServiceOrderRecurringSubscription');
const savePaymentMethodForSubscription = require('../../uow/delivery/onlineOrder/savePaymentMethodForSubscription');
const cancelDoorDashDeliveryUow = require('../../uow/delivery/doordash/cancelDoorDashDeliveryUow');

const deliverableServicePriceAndModifierUow = require('../../uow/order/deliverableServicePriceAndModifierUow');
const { determineTierId } = require('../../uow/order/serviceOrder/determineTierId');
// Events
const eventEmitter = require('../../config/eventEmitter');

// Constants
const { orderSmsEvents } = require('../../constants/constants');

async function createOnlineOrder(payload) {
    try {
        const createOnlineOrderPipeline = new Pipeline([
            determineTierId,
            createStoreCustomer,
            updateStoreCustomerNotes,
            createServiceOrder,
            createOrder,
            deliverableServicePriceAndModifierUow,
            createServiceOrderItems,
            createServiceOrderBags,
            createPickupDoorDash,
            // requiresUberAuthToken, uncomment for uber
            // getUberAuthToken, uncomment for uber.
            // createUberDelivery, uncomment for uber.
            createPickupOrderDelivery,
            createIntentCreatedDeliveryUow,
            createRecurringSubscription,
            createServiceOrderRecurringSubscription,
            savePaymentMethodForSubscription,
            updateServiceOrderTotals,
            createOrderPromoDetail,
            createStripeCustomer,
            createStripePaymentIntent,
            createPaymentObject,
            // sendDeliveryOrderEmailToBusinessOwner,
        ]);
        const output = await createOnlineOrderPipeline.run(payload);
        eventEmitter.emit('onlineOrderSubmitted', output);
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.ONLINE_ORDER_CREATED,
            output.serviceOrder.id,
        );

        if (output.orderDelivery.pickup.deliveryProvider === 'DOORDASH') {
            eventEmitter.emit('doorDashOrderSubmitted', {
                orderDelivery: output.pickupOrderDelivery,
            });
        }

        if (output.intentCreatedDelivery) {
            eventEmitter.emit('intentCreatedOrderDelivery', {
                serviceOrderId: output.serviceOrder.id,
                intentCreatedDelivery: output.intentCreatedDelivery,
                storeTimezone: output.store.settings
                    ? output.store.settings.timeZone
                    : output.settings
                    ? output.settings.timeZone
                    : 'UTC',
            });
        }

        return output;
    } catch (error) {
        if (
            payload.orderDelivery &&
            payload.orderDelivery.pickup &&
            payload.orderDelivery.pickup.thirdPartyDeliveryId
        ) {
            payload.orderDelivery = payload.orderDelivery.pickup;
            await cancelDoorDashDeliveryUow(payload);
        }
        throw error;
    }
}

module.exports = exports = createOnlineOrder;
