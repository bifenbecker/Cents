const Pipeline = require('../pipeline');

// uows
const validateMachinePriceOrTurnTimeUOW = require('../../uow/machines/validatePriceOrTurnTimeForMachineUOW');
const getModelInfoUOW = require('../../uow/machines/getModelInfoUOW');
const validateMachineNameUOW = require('../../uow/machines/validateMachineNameUOW');
const addMachineUOW = require('../../uow/machines/addMachineUOW');
const validateDeviceUOW = require('../../uow/machines/validateDeviceUOW');

/**
 *
 * add machine pipeline
 * @param {*} payload
 */
async function addMachinePipeline(payload) {
    try {
        const addMachine = new Pipeline([
            getModelInfoUOW,
            validateMachinePriceOrTurnTimeUOW,
            validateMachineNameUOW,
            validateDeviceUOW,
            addMachineUOW,
        ]);
        const output = await addMachine.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}
module.exports = exports = addMachinePipeline;
