const createOrderDelivery = require('./createOrderDelivery');
const { orderDeliveryStatuses } = require('../../../constants/constants');
const eventEmitter = require('../../../config/eventEmitter');

// TODO: make the thirdPartyDelivery objects dynamic to allow for multiple third parties

async function createPickupOrderDelivery(payload) {
    const pickupOrderDelivery = await createOrderDelivery({
        ...payload,
        orderDelivery: {
            ...payload.orderDelivery.pickup,
            status: orderDeliveryStatuses.SCHEDULED,
        },
        thirdPartyDelivery: payload.thirdPartyPickup,
    });
    payload.pickupOrderDelivery = pickupOrderDelivery;
    payload.orderDelivery.pickup = pickupOrderDelivery;

    // emit event: intentCreatedOrderPickup
    // TODO: NEED TO ADD TO MANAGE ORDER FLOWS AS WELL
    eventEmitter.emit('intentCreatedOrderPickup', {
        serviceOrderId: payload.serviceOrder.id,
        intentCreatedPickup: payload.orderDelivery.pickup,
        storeTimezone: payload.settings.timeZone,
    });
    return payload;
}

module.exports = exports = createPickupOrderDelivery;
