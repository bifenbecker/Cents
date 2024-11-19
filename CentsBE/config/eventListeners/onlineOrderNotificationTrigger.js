const eventEmitter = require('../eventEmitter');
const { onlineOrderSubmitQueue } = require('../../appQueues');

eventEmitter.on('onlineOrderSubmitted', (payload) => {
    onlineOrderSubmitQueue.add('onlineOrderSubmitQueue', payload);
});

module.exports = eventEmitter;
