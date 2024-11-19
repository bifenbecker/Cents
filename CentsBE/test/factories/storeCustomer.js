const { factory } = require('factory-girl');
const faker = require('faker');
const StoreCustomer = require('../../models/storeCustomer');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./centsCustomers');
require('./laundromatBusinesses');
require('./stores');

factory.define(FN.storeCustomer, StoreCustomer, {
    email: factory.sequence('User.email', (n) => `user-${n}@gmail.com`),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
    storeId: factory.assoc(FN.store, 'id'),
    businessId: factory.assoc(FN.laundromatBusiness, 'id'),
    centsCustomerId: factory.assoc(FN.centsCustomer, 'id'),
});

module.exports = exports = factory;
