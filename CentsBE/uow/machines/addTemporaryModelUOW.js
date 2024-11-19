const MachineModel = require('../../models/machineModel');
/**
 *
 * gets model and type info of a  machine
 * @param {*} payload
 */
async function addTemporaryModel(payload) {
    const { transaction } = payload;
    const newPayload = { ...payload };

    const isoString = new Date().toISOString();
    const machineModel = await MachineModel.query(transaction)
        .insert({
            modelName: payload.modelName,
            capacity: payload.capacity,
            typeId: payload.machineTypeId,
            createdAt: isoString,
            updatedAt: isoString,
        })
        .returning('*');

    newPayload.modelId = machineModel.id;

    return newPayload;
}
module.exports = exports = addTemporaryModel;
