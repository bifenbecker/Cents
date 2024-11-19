const { factory } = require('factory-girl');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachinePricing = require('../../models/machinePricing');
const { MACHINE_PRICING_TYPES } = require('../../constants/constants');
require('./machines');
require('./machineModelLoads');
require('./machineModelModifiers');

factory.define(FACTORIES_NAMES.machinePricing, MachinePricing, {
    machineId: factory.assoc(FACTORIES_NAMES.machine, 'id'),
    loadId: factory.assoc(FACTORIES_NAMES.machineModelLoad, 'id'),
    modifierId: factory.assoc(FACTORIES_NAMES.machineModelModifier, 'id'),
    type: MACHINE_PRICING_TYPES.BASE_VEND,
    price: 1.25,
    unit: 'wash',
    unitLot: 1,
    unitTime: 23,
    isDeleted: false,
});

factory.extend(
    FACTORIES_NAMES.machinePricing,
    FACTORIES_NAMES.machinePricingBaseVend,
    {
        loadId: null,
        modifierId: null,
        type: MACHINE_PRICING_TYPES.BASE_VEND,
    },
);

factory.extend(
    FACTORIES_NAMES.machinePricing,
    FACTORIES_NAMES.machinePricingLoadTemperature,
    {
        loadId: factory.assoc(FACTORIES_NAMES.machineModelLoad, 'id'),
        modifierId: null,
        type: MACHINE_PRICING_TYPES.LOAD_TEMPERATURE,
    },
);

factory.extend(
    FACTORIES_NAMES.machinePricing,
    FACTORIES_NAMES.machinePricingModifier,
    {
        loadId: null,
        modifierId: factory.assoc(FACTORIES_NAMES.machineModelModifier, 'id'),
        type: MACHINE_PRICING_TYPES.MACHINE_MODIFIER,
    },
);

module.exports = exports = factory;
