const Machine = require('../../../models/machine');
const MachinePricing = require('../../../models/machinePricing');

/**
 * update machine details based on the body fields
 * @param {object} payload
 */

async function updateMachineDetails(payload) {
    try {
        const { field, value, machineId, transaction, machineTypeName } = payload;
        // updating the machine details by inline
        // check the machineType only dryers are required turnTimeInMinutes
        if (field === 'turnTimeInMinutes') {
            if (machineTypeName === 'DRYER') {
                await Machine.query(transaction)
                    .patch({
                        turnTimeInMinutes: value,
                    })
                    .findById(machineId);
            } else {
                throw new Error('turnTimeInMinutes is applicable for dryers only');
            }
        }
        if (field === 'name') {
            await Machine.query(transaction)
                .patch({
                    name: value,
                })
                .findById(machineId);
        }
        // check the machineType only washers are required pricePerTurnInCents
        if (field === 'pricePerTurnInCents') {
            if (machineTypeName === 'WASHER') {
                await MachinePricing.query(transaction)
                    .patch({
                        price: value,
                    })
                    .where('machineId', machineId);
            } else {
                throw new Error('pricePerTurnInCents is applicable for washers only');
            }
        }
        if (field === 'serialNumber') {
            await Machine.query(transaction)
                .patch({
                    serialNumber: value,
                })
                .findById(machineId);
        }
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = updateMachineDetails;
