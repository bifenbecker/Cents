const eventEmitter = require('../eventEmitter');
const { doorDashOrderSubmittedQueue } = require('../../appQueues');

eventEmitter.on('doorDashOrderSubmitted', (payload) => {
    doorDashOrderSubmittedQueue.add('doorDashOrderSubmittedQueue', payload);
});

module.exports = eventEmitter;
