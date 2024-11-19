const { factory } = require('factory-girl');
const faker = require('faker');
const Store = require('../../models/store');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');
require('./laundromatBusinesses');
require('./taxRates');

factory.define(FN.store, Store, {
    name: faker.random.word(),
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
    city: factory.chance('city', { country: 'us' }),
    state: factory.chance('state', { country: 'us' }),
    zipCode: faker.address.zipCode(),
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
    address: factory.chance('address'),
    password: faker.internet.password(),
    taxRateId: factory.assoc(FN.taxRate, 'id'),
    type: 'STANDALONE',
});

module.exports = exports = factory;
