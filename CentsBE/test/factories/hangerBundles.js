const { factory } = require('factory-girl');
const HangerBundles = require('../../models/hangerBundles');
const faker = require('faker');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./serviceOrders');

factory.define(FN.hangerBundles, HangerBundles, {
    notes: faker.random.words(2),
    serviceOrderId: factory.assoc(FN.serviceOrder, 'id'),
    manualNoteAdded: true,
});

module.exports = exports = factory;
