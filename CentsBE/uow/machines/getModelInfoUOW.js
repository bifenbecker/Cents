const MachineModels = require('../../models/machineModel');
/**
 *
 * gets model and type info of a  machine
 * @param {*} payload
 */
async function getModelInfo(payload) {
    const { transaction } = payload;
    const newPayload = payload;
    if (payload.modelId) {
        const modelInfo = await MachineModels.query(transaction)
            .withGraphFetched('machineType')
            .findById(payload.modelId);
        if (!modelInfo) {
            throw new Error('invalid model id');
        }
        newPayload.machineTypeName = modelInfo.machineType.name;
        newPayload.machineTypeId = modelInfo.machineType.id;
    }
    return newPayload;
}
module.exports = exports = getModelInfo;
