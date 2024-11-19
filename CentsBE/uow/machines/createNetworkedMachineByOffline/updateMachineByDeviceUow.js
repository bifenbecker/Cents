const { MACHINE_TYPES } = require('../../../constants/constants');
const Machine = require('../../../models/machine');
const {
    ConflictException,
    NotFoundException,
    BadRequestException,
} = require('../../../constants/httpExceptions');
const { getMachineByNameAndStore } = require('../../../services/machines/queries');

/**
 * updates machine according to device configuration
 * @param {{transaction: any, currentUser, device: Object, origin: String, machineModel: Object, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @param {Function} errorHandler
 * @returns object
 */
async function updateMachineByDeviceUow(payload, errorHandler) {
    const {
        transaction,
        origin,
        device,
        machineModel,
        machineName,
        currentUser,
        machineType,
        machineId,
        configurations,
    } = payload;

    const machine = await Machine.query(transaction)
        .findById(machineId)
        .withGraphJoined('[pairing(pairingFilter)]')
        .modifiers({
            pairingFilter: (query) => {
                query.where('deletedAt', null).first();
            },
        });
    if (!machine) {
        const error = new NotFoundException('Machine does not exist');
        errorHandler(error);
        throw error;
    }

    if (machine.pairing?.length) {
        const error = new BadRequestException('Machine is already paired');
        errorHandler(error);
        throw error;
    }

    const machineNameLowerCase = machineName.toLowerCase();
    if (machine.name?.toLowerCase() !== machineNameLowerCase) {
        const machineWithDuplicatedName = await getMachineByNameAndStore(
            machineName,
            device.batch.storeId,
            transaction,
        );
        if (machineWithDuplicatedName) {
            const error = new ConflictException(
                'Machine with such name already exist in the store',
            );
            errorHandler(error);
            throw error;
        }
    }

    const {
        machineFeature: { LaundryMachineModel: laundryMachineModel },
        machineModel: { LMSerial: lmSerial },
    } = configurations;

    let turnTimeInMinutes = null;
    if (machineType.name === MACHINE_TYPES.DRYER) {
        turnTimeInMinutes = Math.trunc(Number(laundryMachineModel.CycleTime) / 60);
    }

    const machineUpdated = await Machine.query(transaction)
        .patchAndFetchById(machineId, {
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
        machine: machineUpdated,
    };
}

module.exports = updateMachineByDeviceUow;
