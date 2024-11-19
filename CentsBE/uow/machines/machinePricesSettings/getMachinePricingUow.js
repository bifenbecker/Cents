const Machine = require('../../../models/machine');
const MachinePricing = require('../../../models/machinePricing');
const {
    mapMachinePricingToBase,
    mapMachinePricingToModifier,
    isMachinePricingBaseVend,
} = require('../../../utils/machines/machinePricingUtil');
const { NotFoundException } = require('../../../constants/httpExceptions');

async function getMachinePricingUow(payload, errorHandling) {
    const { transaction, machineId } = payload;
    const machine = await Machine.query(transaction).findById(machineId);
    if (!machine) {
        const error = new NotFoundException('Machine does not exist');
        errorHandling(error);
        throw error;
    }

    const machinePricing = await MachinePricing.query(transaction)
        .where('machineId', machineId)
        .withGraphJoined(
            '[machineModelLoad.[machineLoadType], machineModelModifier.[machineModifierType]]',
        );

    const basePricing = machinePricing
        .filter((machinePricingItem) => {
            const isBaseVend = isMachinePricingBaseVend(machinePricingItem);

            return isBaseVend || machinePricingItem.loadId;
        })
        .map((basePricingItem) => mapMachinePricingToBase(basePricingItem));

    const modifierPricing = machinePricing
        .filter((machinePricingItem) => machinePricingItem.modifierId)
        .map((modifierPricingItem) => mapMachinePricingToModifier(modifierPricingItem));

    return {
        ...payload,
        basePricing,
        modifierPricing,
    };
}

module.exports = getMachinePricingUow;
