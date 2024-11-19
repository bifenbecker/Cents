const ModelLoad = require('../../models/machineModelLoad');

async function validateMachineLoad(modelId) {
    try {
        const allModelLoads = await ModelLoad.query().where('modelId', '=', modelId);
        return allModelLoads.map((load) => load.id);
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = exports = validateMachineLoad;
