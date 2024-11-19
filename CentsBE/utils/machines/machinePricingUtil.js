const { MACHINE_PRICING_LABELS } = require('../../constants/constants');

/**
 * This utility method maps MachinePricing model to basePricing response item
 *
 * @param {{ machineModelLoad: {machineLoadType: {name: String}}, price: Number, unitTime: Number, id: Number }} machinePricing
 * @return {Object}
 */
const mapMachinePricingToBase = (machinePricing) => {
    const { machineModelLoad, price, unitTime, id: machinePricingId } = machinePricing;
    const label = machineModelLoad?.machineLoadType?.name || MACHINE_PRICING_LABELS.BASE_VEND;

    return {
        label,
        minutes: unitTime || null,
        price,
        machinePricingId,
    };
};

/**
 * This utility method maps MachinePricing model to modifierPricing response item
 *
 * @param {{ machineModelModifier: {machineModifierType: {name: String}}, price: Number, unitTime: Number, id: Number }} machinePricing
 * @return {Object}
 */
const mapMachinePricingToModifier = (machinePricing = {}) => {
    const { machineModelModifier, price, unitTime, id: machinePricingId } = machinePricing;
    const label = machineModelModifier?.machineModifierType?.name;

    return {
        label,
        minutes: unitTime || null,
        price,
        machinePricingId,
    };
};

/**
 * Is machine pricing for Base Vend
 *
 * @param {{ loadId: Number, modifierId: Number }} machinePricing
 * @return {Boolean}
 */
const isMachinePricingBaseVend = (machinePricing = {}) => {
    const { loadId, modifierId } = machinePricing;

    return !loadId && !modifierId;
};

module.exports = {
    mapMachinePricingToBase,
    mapMachinePricingToModifier,
    isMachinePricingBaseVend,
};
