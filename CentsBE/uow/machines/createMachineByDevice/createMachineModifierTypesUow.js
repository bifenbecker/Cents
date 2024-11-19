const { raw } = require('objection');
const { isEmpty } = require('lodash');
const MachineModifierType = require('../../../models/machineModifierType');

/**
 * creates machine modifier types if they do not exist
 * @param {{transaction: any, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @returns object
 */
async function createMachineModifierTypesUow(payload) {
    const { configurations, transaction } = payload;
    const {
        MachineVendPrices: { ModifierCyclePrices: modifierCyclePrices },
    } = configurations.machineProgramming;

    if (isEmpty(modifierCyclePrices)) {
        return { ...payload, machineModifierTypes: [] };
    }

    const modifierCyclesKeys = Object.keys(modifierCyclePrices);
    const modifierTypesMatched = await MachineModifierType.query(transaction)
        .whereIn(
            raw('lower("name")'),
            modifierCyclesKeys.map((cycleName) => cycleName.toLowerCase()),
        )
        .distinctOn(['name']);

    if (modifierTypesMatched.length === modifierCyclesKeys.length) {
        return {
            ...payload,
            machineModifierTypes: modifierTypesMatched,
        };
    }

    const modifierCycleNewKeys = modifierCyclesKeys.filter((modifierCycle) => {
        const modifierTypeMatched = modifierTypesMatched.find(
            (modifierType) => modifierType.name.toLowerCase() === modifierCycle.toLowerCase(),
        );
        return !modifierTypeMatched;
    });

    const machineModifierTypesNewDto = modifierCycleNewKeys.map((baseCyclesKey) => ({
        name: baseCyclesKey,
    }));
    const machineModifierTypesNew = await MachineModifierType.query(transaction).insertAndFetch(
        machineModifierTypesNewDto,
    );

    return {
        ...payload,
        machineModifierTypes: [...modifierTypesMatched, ...machineModifierTypesNew],
    };
}

module.exports = createMachineModifierTypesUow;
