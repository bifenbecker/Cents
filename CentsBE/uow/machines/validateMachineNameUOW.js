const { raw } = require('objection');
const Machine = require('../../models/machine');

/**
 *
 * validate a machine name
 * @param {*} payload
 */
async function validateMachineName(payload) {
    const { transaction, machineTypeName } = payload;
    if (payload.name && payload.storeId) {
        const machines = await Machine.query(transaction)
            .withGraphJoined('[model.[machineType]]')
            .where(raw('lower(machines.name)'), payload.name.trim().toLowerCase())
            .where('machines.storeId', payload.storeId);
        machines.forEach((machine) => {
            if (machine && machine.model.machineType.name === machineTypeName) {
                throw new Error('Name already exists.');
            }
        });
    }
    return payload;
}
module.exports = exports = validateMachineName;
