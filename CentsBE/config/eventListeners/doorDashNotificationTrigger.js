const eventEmitter = require('../eventEmitter');
const { doorDashDeliveryUpdateQueue } = require('../../appQueues');

eventEmitter.on('doorDashDeliveryUpdate', (payload) => {
    doorDashDeliveryUpdateQueue.add('doorDashDeliveryUpdateQueue', payload);
});

module.exports = eventEmitter;
