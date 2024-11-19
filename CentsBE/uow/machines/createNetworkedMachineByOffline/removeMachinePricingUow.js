const MachinePricing = require('../../../models/machinePricing');

/**
 * adds deletedAt flag to the existing machine pricing
 * @param {{transaction: any, machineId: String}} payload
 * @returns object
 */
async function removeMachinePricingUow(payload) {
    const { transaction, machineId } = payload;

    const machinePricingUpdateDto = {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
    };
    await MachinePricing.query(transaction)
        .patch(machinePricingUpdateDto)
        .where('machineId', machineId);

    return payload;
}

module.exports = removeMachinePricingUow;
