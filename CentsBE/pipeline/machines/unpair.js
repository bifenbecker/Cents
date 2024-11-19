const Pipeline = require('../pipeline');
const eventEmitter = require('../../config/eventEmitter');

// Uows
const unpairMachine = require('../../uow/machines/unpair');

async function unpairPipeline(payload) {
    const reqPayload = payload || { ...payload, ...{ payloadType: 'unpair' } };
    try {
        const unpairingPipeline = new Pipeline([unpairMachine]);
        const output = await unpairingPipeline.run(reqPayload);
        eventEmitter.emit('machine-unpaired', {
            storeId: output.store.id,
            payload: { machineId: output.id },
        });
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = unpairPipeline;
