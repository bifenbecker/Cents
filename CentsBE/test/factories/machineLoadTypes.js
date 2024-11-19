const { factory } = require('factory-girl');
const { MACHINE_LOAD_TYPES } = require('../../constants/constants');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineLoadType = require('../../models/machineLoad');

factory.define(FACTORIES_NAMES.machineLoadType, MachineLoadType, {
    name: MACHINE_LOAD_TYPES.WARM,
})

module.exports = exports = factory;
