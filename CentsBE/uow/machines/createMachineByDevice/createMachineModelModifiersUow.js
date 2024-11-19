const MachineModelModifier = require('../../../models/machineModelModifier');

/**
 * creates machine model modifiers for each machine modifier type needed
 * @param {{transaction: any, machineModifierTypes: Array<Object>, machineModel: Object}} payload
 * @returns object
 */
async function createMachineModelModifiersUow(payload) {
    const { machineModifierTypes, machineModel, transaction } = payload;
    if (!machineModifierTypes.length) {
        return {
            ...payload,
            machineModelModifiers: [],
        };
    }

    const machineModelModifiersDto = machineModifierTypes.map((modifierType) => ({
        modelId: machineModel.id,
        machineModifierTypeId: modifierType.id,
    }));
    const machineModelModifiers = await MachineModelModifier.query(transaction).insertAndFetch(
        machineModelModifiersDto,
    );

    return {
        ...payload,
        machineModelModifiers,
    };
}

module.exports = createMachineModelModifiersUow;
