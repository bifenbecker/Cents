const machinePricing = require('../../models/machinePricing');

async function machinePrices(machineId) {
    try {
        const allPrices = await machinePricing.query().where('machineId', '=', machineId);
        return allPrices.map((price) => price.id);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = machinePrices;
