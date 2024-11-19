const { factory } = require('factory-girl');
const faker = require('faker');
const { deviceStatuses } = require('../../constants/constants');
const Device = require('../../models/device');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./batches');

factory.define(FACTORIES_NAMES.device, Device, {
    batchId: factory.assoc(FACTORIES_NAMES.batch, 'id'),
    name: () => faker.random.uuid(), // device name should be unique
    isActive: faker.random.boolean(),
    isPaired: faker.random.boolean(),
    status: deviceStatuses.OFFLINE,
});

factory.extend(FACTORIES_NAMES.device, FACTORIES_NAMES.devicePaired, {
    isPaired: true,
});

factory.extend(FACTORIES_NAMES.devicePaired, FACTORIES_NAMES.devicePairedOnline, {
    status: deviceStatuses.ONLINE,
});

module.exports = exports = factory;
