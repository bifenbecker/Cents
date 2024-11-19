const Pipeline = require('../pipeline');

// uows
const getModelInfoUOW = require('../../uow/machines/getModelInfoUOW');
const validateMachineNameUOW = require('../../uow/machines/validateMachineNameUOW');
/**
 *
 * validate machine name pipeline
 * @param {*} payload
 */
async function validateMachineNamePipeline(payload) {
    try {
        const addMachine = new Pipeline([getModelInfoUOW, validateMachineNameUOW]);
        await addMachine.run(payload);
    } catch (error) {
        throw Error(error.message);
    }
}
module.exports = exports = validateMachineNamePipeline;
