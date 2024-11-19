const MachineModelLoad = require('../../../models/machineModelLoad');

/**
 * creates machine model loads for each load type needed
 * @param {{transaction: any, machineLoadTypes: Array<Object>, machineModel: Object}} payload
 * @returns object
 */
async function createModelLoadsUow(payload) {
    const { machineLoadTypes, machineModel, transaction } = payload;

    const machineModelLoadsDto = machineLoadTypes.map((loadType) => ({
        modelId: machineModel.id,
        loadId: loadType.id,
    }));
    const machineModelLoads = await MachineModelLoad.query(transaction).insertAndFetch(
        machineModelLoadsDto,
    );

    return {
        ...payload,
        machineModelLoads,
    };
}

module.exports = createModelLoadsUow;
