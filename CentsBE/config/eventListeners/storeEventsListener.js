const eventEmitter = require('../eventEmitter');
const { storeQueue } = require('../../appQueues');

eventEmitter.on('storeCreated', (storeId) => {
    storeQueue.add('store_updated', { storeId });
});

eventEmitter.on('storeUpdated', (storeId) => {
    storeQueue.add('store_updated', { storeId });
});

eventEmitter.on('storeSettingsCreated', (storeId) => {
    storeQueue.add('index_store', { storeId });
});

eventEmitter.on('storeSettingsUpdated', (storeId) => {
    storeQueue.add('index_store', { storeId });
});

module.exports = eventEmitter;
