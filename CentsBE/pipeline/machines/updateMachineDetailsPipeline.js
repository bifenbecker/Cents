const Pipeline = require('../pipeline');

// Uows
const validateMachineNameUOW = require('../../uow/machines/machineDetails/validateMachineNameUow');
const updateMachineDetailsUOW = require('../../uow/machines/machineDetails/updateMachineDetailsUOw');

async function updateMachineDetailsPipeline(payload) {
    try {
        const updateMachineDetails = new Pipeline([
            validateMachineNameUOW,
            updateMachineDetailsUOW,
        ]);
        const output = await updateMachineDetails.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = updateMachineDetailsPipeline;
