const { factory } = require('factory-girl');
const StorageRacks = require('../../models/storageRacks');
const faker = require('faker');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceOrders');

factory.define(FN.storageRacks, StorageRacks, {
    rackInfo: faker.random.words(2),
    serviceOrderId: factory.assoc(FN.serviceOrder, 'id'),
});

module.exports = exports = factory;
