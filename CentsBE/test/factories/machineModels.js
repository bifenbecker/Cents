const { factory } = require('factory-girl');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineModel = require('../../models/machineModel');
require('./machineTypes');

factory.define(FACTORIES_NAMES.machineModel, MachineModel, {
    typeId: factory.assoc(FACTORIES_NAMES.machineTypeWasher, 'id'),
    modelName: faker.random.word(),
    capacity: faker.random.word(),
    manufacturer: faker.random.word(),
});

factory.extend(FACTORIES_NAMES.machineModel, FACTORIES_NAMES.machineModelDryerType, {
    typeId: factory.assoc(FACTORIES_NAMES.machineTypeDryer, 'id'),
});

factory.extend(FACTORIES_NAMES.machineModel, FACTORIES_NAMES.machineModelWasherType, {
    typeId: factory.assoc(FACTORIES_NAMES.machineTypeWasher, 'id'),
});

module.exports = exports = factory;
