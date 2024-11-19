const { factory } = require('factory-girl');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineModelModifier = require('../../models/machineModelModifier');

factory.define(FACTORIES_NAMES.machineModelModifier, MachineModelModifier, {
    modelId: factory.assoc(FACTORIES_NAMES.machineModelWasherType,'id'),
    machineModifierTypeId: factory.assoc(FACTORIES_NAMES.machineModifierType, 'id'),
});


module.exports = exports = factory;
