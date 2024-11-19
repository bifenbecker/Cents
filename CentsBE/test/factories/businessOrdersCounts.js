const { factory } = require('factory-girl');
const faker = require('faker');
const BusinessOrderCount = require('../../models/businessOrderCount');

require('./laundromatBusinesses');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');

factory.define(FACTORIES_NAMES.businessOrderCount, BusinessOrderCount, {
    businessId: factory.assoc(FACTORIES_NAMES.laundromatBusiness, 'id'),
    totalOrders: faker.random.number(),
});

module.exports = exports = factory;
