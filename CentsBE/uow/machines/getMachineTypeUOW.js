const MachineType = require('../../models/machineType');

/**
 *
 * gets model and type info of a  machine
 * @param {*} payload
 */
async function getMachineType(payload) {
    const { transaction } = payload;
    const newPayload = { ...payload };
    if (!payload.machineType) {
        throw new Error('invalid machine type');
    }
    const machineType = await MachineType.query(transaction)
        .where('name', '=', payload.machineType)
        .first();
    if (!machineType) {
        throw new Error('invalid machine type');
    }
    newPayload.machineTypeName = machineType.name;
    newPayload.machineTypeId = machineType.id;

    return newPayload;
}

module.exports = exports = getMachineType;
