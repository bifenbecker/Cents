const { factory } = require('factory-girl');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const MachineModifierType = require('../../models/machineModifierType');

factory.define(FACTORIES_NAMES.machineModifierType, MachineModifierType, {
    name: () => `${faker.random.arrayElement(["LIGHT", "MEDIUM", "HEAVY"])}_${faker.random.uuid()}`,
});

module.exports = exports = factory;
