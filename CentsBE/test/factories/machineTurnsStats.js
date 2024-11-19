const { factory } = require('factory-girl');
const MachineTurnsStats = require('../../models/machineTurnsStats');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./machines');

factory.define(FACTORIES_NAMES.machineTurnsStats, MachineTurnsStats, {
    machineId: factory.assoc(FACTORIES_NAMES.machine, 'id'),
    avgTurnsPerDay: faker.random.number(),
    avgSelfServeRevenuePerDay: faker.random.number(),
});

module.exports = exports = factory;
