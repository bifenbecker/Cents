const uuid = require('uuid/v4');

function machine(storeId, modelId) {
    return {
        name: `S${storeId}-`,
        storeId,
        serialNumber: uuid(),
        modelId,
    };
}

module.exports = exports = machine;
