// models
const Machine = require('../../models/machine');
const MachinePricing = require('../../models/machinePricing');

// utils
const getPermittedParamsObject = require('../../utils/permittedParams');

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
async function addOfflineMachine(payload) {
    try {
        const { transaction } = payload;
        const permittedParams = [
            'userId',
            'origin',
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

        return machine;
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = exports = addOfflineMachine;
