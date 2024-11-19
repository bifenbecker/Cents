const Pipeline = require('../pipeline');
const mapMachinesData = require('../../uow/machines/mapMachinesData');
const insertMultipleMachinesPairing = require('../../uow/machines/insertMultipleMachinesPairing');
const eventEmitter = require('../../config/eventEmitter');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function pairMachinesAndDevices(machinesData) {
    try {
        const pairMachinesPipeLine = new Pipeline([mapMachinesData, insertMultipleMachinesPairing]);
        const result = await pairMachinesPipeLine.run(machinesData);
        if (result.errors && result.errors.length) {
            return {
                errors: result.errors,
            };
        }
        eventEmitter.emit('devices-bulk-paired', {
            storeId: machinesData.storeId,
            machines: result.storeEventMessage,
            newMachinesCount: result.newMachines,
        });
        return {
            pairedMachines: result.pairedMachines,
            newMachines: result.newMachines,
        };
    } catch (err) {
        LoggerHandler('error', err);
        throw err;
    }
}

module.exports = pairMachinesAndDevices;
