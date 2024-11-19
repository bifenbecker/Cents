const Machine = require('../models/machine');

async function findStore(machineId) {
    const { storeId } = await Machine.query().findById(machineId);
    return storeId;
}

module.exports = findStore;
