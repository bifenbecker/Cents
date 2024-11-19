const { factory } = require('factory-girl');
const faker = require('faker');
const Batch = require('../../models/batch');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.batch, Batch, {
    storeId: factory.assoc(FACTORIES_NAMES.store, 'id'),
    businessId: factory.assoc(FACTORIES_NAMES.laundromatBusiness, 'id'),
    batchName: faker.random.word(),
});

module.exports = exports = factory;
