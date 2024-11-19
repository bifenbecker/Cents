const { factory } = require('factory-girl');
const faker = require('faker');
const Pairing = require('../../models/pairing');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./users');
require('./machines');
require('./devices');

factory.define(FACTORIES_NAMES.pairing, Pairing, {
    deviceId: factory.assoc(FACTORIES_NAMES.device, 'id'),
    machineId: factory.assoc(FACTORIES_NAMES.machine, 'id'),
    pairedByUserId: factory.assoc(FACTORIES_NAMES.user, 'id'),
    unPairedByUserId: factory.assoc(FACTORIES_NAMES.user, 'id'),
    origin: faker.random.word(),
});

module.exports = exports = factory;
