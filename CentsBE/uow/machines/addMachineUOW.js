const Machine = require('../../models/machine');
const Pairing = require('../../models/pairing');
const Device = require('../../models/device');
const MachinePricing = require('../../models/machinePricing');
const getPermittedParamsObject = require('../../utils/permittedParams');

const addPairing = async (payload) => {
    await Pairing.query(payload.transaction).insert({
        deviceId: payload.deviceId,
        machineId: payload.machineId,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pairedByUserId: payload.userId,
        origin: payload.origin,
    });
};

const updateDevice = async (payload) => {
    await Device.query(payload.transaction)
        .patch({
            isPaired: true,
            isActive: true,
        })
        .findById(payload.deviceId);
};

const addMachinePricing = async (payload) => {
    await MachinePricing.query(payload.transaction).insert({
        machineId: payload.machineId,
        price: payload.pricePerTurnInCents // default 25 is for dryer
            ? payload.pricePerTurnInCents
            : 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
};

/**
 *
 * adds machine and pairing info
 * @param {*} payload
 */
async function addMachine(payload) {
    try {
        const { transaction } = payload;
        const permittedParams = [
            'userId',
            'origin',
            'deviceId',
            'storeId',
            'modelId',
            'name',
            'serialNumber',
            'pricePerTurnInCents',
            'turnTimeInMinutes',
        ];
        const addMachinePayload = await getPermittedParamsObject(payload, permittedParams);
        const isoString = new Date().toISOString();
        const machine = await Machine.query(transaction)
            .insert({
                storeId: addMachinePayload.storeId,
                modelId: addMachinePayload.modelId,
                name: addMachinePayload.name.trim(),
                serialNumber: addMachinePayload.serialNumber
                    ? addMachinePayload.serialNumber
                    : null,
                isActive: true,
                createdAt: isoString,
                updatedAt: isoString,
                turnTimeInMinutes: addMachinePayload.turnTimeInMinutes
                    ? addMachinePayload.turnTimeInMinutes
                    : null,
                userId: addMachinePayload.userId,
                origin: addMachinePayload.origin,
            })
            .returning('*');
        await addMachinePricing({
            ...addMachinePayload,
            machineId: machine.id,
            transaction,
        });
        if (addMachinePayload.deviceId) {
            await addPairing({
                ...addMachinePayload,
                machineId: machine.id,
                transaction,
            });
            await updateDevice({ ...addMachinePayload, transaction });
        }

        return machine;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = addMachine;
