const { factory } = require('factory-girl');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineType = require('../../models/machineType');
const { MACHINE_TYPES } = require('../../constants/constants');

factory.define(FACTORIES_NAMES.machineType, MachineType, {
    name: MACHINE_TYPES.WASHER,
});

factory.extend(FACTORIES_NAMES.machineType, FACTORIES_NAMES.machineTypeWasher, {
    name: MACHINE_TYPES.WASHER,
});

factory.extend(FACTORIES_NAMES.machineType, FACTORIES_NAMES.machineTypeDryer, {
    name: MACHINE_TYPES.DRYER,
});

module.exports = exports = factory;
