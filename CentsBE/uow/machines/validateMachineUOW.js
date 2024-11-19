const Machine = require('../../models/machine');
/**
 *
 * validate a machine
 * @param {*} payload
 */
async function validateMachine(payload) {
    const { transaction } = payload;
    const newPayload = payload;
    if (payload.machineId) {
        const machine = await Machine.query(transaction).findById(payload.machineId);
        if (!machine) {
            throw new Error('Invalid machine id.');
        } else {
            newPayload.isNewMachine = false;
            return newPayload;
        }
    }
    newPayload.isNewMachine = true;
    return newPayload;
}
module.exports = exports = validateMachine;
