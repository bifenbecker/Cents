const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

async function sendSMSforCompletingDeliveryOrder(payload) {
    try {
        const { routeDelivery } = payload;

        if (routeDelivery.orderDelivery.type !== 'RETURN') {
            return payload;
        }

        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.ROUTE_DELIVERY_COMPLETED,
            routeDelivery.orderDelivery.order.serviceOrder.id,
        );
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendSMSforCompletingDeliveryOrder;
