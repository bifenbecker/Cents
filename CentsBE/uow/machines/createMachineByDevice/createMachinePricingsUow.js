const MachinePricing = require('../../../models/machinePricing');
const { convertDollarsToCents } = require('../../../utils/convertMoneyUnits');
const { MACHINE_PRICING_TYPES } = require('../../../constants/constants');

/**
 * creates machine pricing by configuration
 * @param {{transaction: any, currentUser: Object, machine: Object, machineLoadTypes: Array<Object>, machineModelLoads: Array<Object>, machineModifierTypes: Array<Object>, machineModelModifiers: Array<Object>, configurations: { machineFeature: Object, machineModel: Object, machineProgramming: Object }}} payload
 * @returns object
 */
async function createMachinePricingsUow(payload) {
    const {
        transaction,
        machineLoadTypes,
        machineModelLoads,
        machineModifierTypes,
        machineModelModifiers,
        machine,
        configurations,
    } = payload;

    const {
        machineProgramming: {
            MachineVendPrices: {
                BaseCyclePrices: baseCyclePrices,
                ModifierCyclePrices: modifierCyclePrices,
            },
        },
    } = configurations;
    const baseCycleKeys = Object.keys(baseCyclePrices);

    const machinePricingBaseItemsDto = baseCycleKeys.map((cycleKey) => {
        const loadType = machineLoadTypes.find(
            ({ name }) => name.toLowerCase() === cycleKey.toLowerCase(),
        );
        const modelLoad = machineModelLoads.find(({ loadId }) => loadId === loadType.id);
        return {
            machineId: machine.id,
            loadId: modelLoad.id,
            modifierId: null,
            type: MACHINE_PRICING_TYPES.LOAD_TEMPERATURE,
            price: convertDollarsToCents(Number(baseCyclePrices[cycleKey])),
        };
    });

    let machinePricingModifierDto = [];
    if (machineModelModifiers.length) {
        const modifierCycleKeys = Object.keys(modifierCyclePrices);
        machinePricingModifierDto = modifierCycleKeys.map((modifierCycleKey) => {
            const machineModifierType = machineModifierTypes.find(
                ({ name }) => name.toLowerCase() === modifierCycleKey.toLowerCase(),
            );
            const modelModifier = machineModelModifiers.find(
                ({ machineModifierTypeId }) => machineModifierTypeId === machineModifierType.id,
            );
            return {
                machineId: machine.id,
                modifierId: modelModifier.id,
                loadId: null,
                type: MACHINE_PRICING_TYPES.MACHINE_MODIFIER,
                price: convertDollarsToCents(Number(modifierCyclePrices[modifierCycleKey])),
            };
        });
    }

    const machinePricings = await MachinePricing.query(transaction).insertAndFetch([
        ...machinePricingBaseItemsDto,
        ...machinePricingModifierDto,
    ]);

    return { ...payload, machinePricings };
}

module.exports = createMachinePricingsUow;
