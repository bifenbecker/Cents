const { MACHINE_TYPES } = require('../../../constants/constants');
const Machine = require('../../../models/machine');
const { getMachineByNameAndStore } = require('../../../services/machines/queries');
const { ConflictException } = require('../../../constants/httpExceptions');

/**
 * creates machine by device configuration
 * @param {{transaction: any, currentUser, device: Object, origin: String, machineModel: Object, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @param {Function} errorHandler
 * @returns object
 */
async function createMachineByDeviceUow(payload, errorHandler) {
    const {
        transaction,
        device,
        origin,
        machineModel,
        machineName,
        currentUser,
        machineType,
        configurations,
    } = payload;

    const machineExisted = await getMachineByNameAndStore(
        machineName,
        device.batch.storeId,
        transaction,
    );
    if (machineExisted) {
        const error = new ConflictException('Machine with such name already exist in the store');
        errorHandler(error);
        throw error;
    }

    const {
        machineFeature: { LaundryMachineModel: laundryMachineModel },
        machineModel: { LMSerial: lmSerial },
    } = configurations;

    let turnTimeInMinutes = null;
    if (machineType.name === MACHINE_TYPES.DRYER) {
        turnTimeInMinutes = Math.trunc(Number(laundryMachineModel.CycleTime) / 60);
    }

    const machine = await Machine.query(transaction)
        .insert({
            storeId: device.batch.storeId,
            modelId: machineModel.id,
            name: machineName.trim(),
            serialNumber: lmSerial || null,
            isActive: true,
            turnTimeInMinutes,
            userId: currentUser.id,
            origin,
        })
        .returning('*');

    return {
        ...payload,
        machine,
    };
}

module.exports = createMachineByDeviceUow;
