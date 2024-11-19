const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

async function sendSMSforCancellingPickupOrder(payload) {
    try {
        const { orderDelivery, serviceOrder } = payload;

        if (orderDelivery.type !== 'PICKUP') {
            return payload;
        }

        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.PICK_UP_ORDER_CANCELED,
            serviceOrder.id,
        );
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendSMSforCancellingPickupOrder;
