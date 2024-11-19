const { MACHINE_TYPES } = require('../../../constants/constants');
const MachineModel = require('../../../models/machineModel');
const MachineType = require('../../../models/machineType');

/**
 * creates machine model by configurations
 * @param {{transaction: any, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @returns object
 */
async function createMachineModelUow(payload) {
    const { configurations, transaction } = payload;

    const { LaundryMachineModel: laundryMachineModel } = configurations.machineFeature;
    const { LMManufacturer: lMManufacturer, LMSize: lMSize } = configurations.machineModel;

    const machineTypeName = Number(laundryMachineModel.Washer_enable)
        ? MACHINE_TYPES.WASHER
        : MACHINE_TYPES.DRYER;

    const machineType = await MachineType.query(transaction).findOne({
        name: machineTypeName,
    });
    if (!machineType) {
        throw new Error('Needed machine type is not found');
    }

    const machineModel = await MachineModel.query(transaction).insertAndFetch({
        typeId: machineType.id,
        modelName: laundryMachineModel.Model,
        capacity: lMSize.toUpperCase(),
        manufacturer: lMManufacturer,
    });

    return {
        ...payload,
        machineModel,
        machineType,
    };
}

module.exports = createMachineModelUow;
