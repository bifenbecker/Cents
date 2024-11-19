const { factory } = require('factory-girl');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineModelLoad = require('../../models/machineModelLoad');
require('./machineLoadTypes')
require('./machineModels')

factory.define(FACTORIES_NAMES.machineModelLoad, MachineModelLoad, {
    modelId: factory.assoc(FACTORIES_NAMES.machineModelWasherType,'id'),
    loadId: factory.assoc(FACTORIES_NAMES.machineLoadType, 'id'),
});


module.exports = exports = factory;
