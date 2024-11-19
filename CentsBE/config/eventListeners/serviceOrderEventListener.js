const eventEmitter = require('../eventEmitter');
const { serviceOrderCompletedQueue } = require('../../appQueues');
const { orderSmsEvents } = require('../../constants/constants');

eventEmitter.on('serviceOrderCompleted', (payload) => {
    serviceOrderCompletedQueue.add('serviceOrderCompletedQueue', payload);
    eventEmitter.emit(
        'orderSmsNotification',
        orderSmsEvents.ORDER_COMPLETED,
        payload.serviceOrderId,
    );
});

module.exports = eventEmitter;
