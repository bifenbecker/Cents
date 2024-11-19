const eventEmitter = require('../eventEmitter');
const PusherOperations = require('../../pusher/PusherOperations');

eventEmitter.on('devices-bulk-paired', (data) => {
    const batches = Math.ceil(data.machines.length / 50);
    for (let i = 0; i < batches; i++) {
        const payload = {
            machines: data.machines.slice(i * 50, (i + 1) * 50),
            newMachinesCount: data.newMachinesCount,
        };
        PusherOperations.publishStoreEvent(data.storeId, payload, 'devices-bulk-paired');
    }
});

eventEmitter.on('machine-unpaired', (data) => {
    PusherOperations.publishStoreEvent(data.storeId, data.payload, 'machine-unpaired');
});

eventEmitter.on('terminal-payment-succeeded', (data) => {
    PusherOperations.publishStoreEvent(data.storeId, data.payload, 'terminal-payment-succeeded');
});

eventEmitter.on('terminal-payment-failed', (data) => {
    PusherOperations.publishStoreEvent(data.storeId, data.payload, 'terminal-payment-failed');
});

module.exports = eventEmitter;
