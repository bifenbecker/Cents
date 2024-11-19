const Pipeline = require('../pipeline');

// Uows
const pairUow = require('../../uow/machines/pair');
const { getMachineDetailsUow } = require('../../uow/machines/machineDetails/getMachineDetailsUow');

async function pairing(payload) {
    try {
        const pairingPipeline = new Pipeline([pairUow, getMachineDetailsUow]);
        const output = await pairingPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = pairing;
