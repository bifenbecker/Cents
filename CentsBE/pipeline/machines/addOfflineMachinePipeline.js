const Pipeline = require('../pipeline');

// uows
const validateMachinePriceOrTurnTimeUOW = require('../../uow/machines/validatePriceOrTurnTimeForMachineUOW');
const validateMachineNameUOW = require('../../uow/machines/validateMachineNameUOW');
const addOfflineMachineUOW = require('../../uow/machines/addOfflineMachineUOW');
const getMachineTypeUOW = require('../../uow/machines/getMachineTypeUOW');
const addTemporaryModel = require('../../uow/machines/addTemporaryModelUOW');

/**
 *
 * add machine pipeline
 * @param {*} payload
 */
async function addOfflineMachinePipeline(payload) {
    try {
        const addOfflineMachine = new Pipeline([
            getMachineTypeUOW,
            addTemporaryModel,
            validateMachinePriceOrTurnTimeUOW,
            validateMachineNameUOW,
            addOfflineMachineUOW,
        ]);
        return await addOfflineMachine.run(payload);
    } catch (error) {
        throw Error(error.message);
    }
}
module.exports = exports = addOfflineMachinePipeline;
