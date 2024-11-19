const Machine = require('../../../models/machine');
const machineNameValidation = require('../validateMachineNameUOW');

async function validateMachineNameUow(payload) {
    try {
        const newPayload = payload;
        const { field, value, machineId, transaction } = payload;
        const machineDetails = await Machine.query(transaction)
            .select('modelId', 'storeId', 'name')
            .withGraphFetched('model.machineType')
            .findById(machineId);

        newPayload.storeId = machineDetails.storeId;
        newPayload.modelId = machineDetails.modelId;
        newPayload.machineTypeName = machineDetails.model.machineType.name;

        if (field === 'name' && machineDetails.name !== value) {
            newPayload.name = value;
            await machineNameValidation(newPayload);
        }
        return newPayload;
    } catch (error) {
        throw new Error(error.message);
    }
}
module.exports = validateMachineNameUow;
