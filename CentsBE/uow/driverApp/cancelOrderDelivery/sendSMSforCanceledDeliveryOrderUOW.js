const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

async function sendSMSforCancellingDeliveryOrder(payload) {
    try {
        const { orderDelivery, serviceOrder } = payload;

        if (orderDelivery.type !== 'RETURN') {
            return payload;
        }

        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.DELIVERY_ORDER_CANCELED,
            serviceOrder.id,
        );
        return payload;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendSMSforCancellingDeliveryOrder;
