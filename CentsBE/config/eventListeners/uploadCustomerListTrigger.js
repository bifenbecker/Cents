const eventEmitter = require('../eventEmitter');
const { uploadCustomerListQueue } = require('../../appQueues');

eventEmitter.on('uploadCustomerList', (payload) => {
    uploadCustomerListQueue.add('uploadCustomerListQueue', payload);
});

module.exports = eventEmitter;
