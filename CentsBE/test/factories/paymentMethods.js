const { factory } = require('factory-girl');
const PaymentMethod = require('../../models/paymentMethod');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
const { PAYMENT_METHOD_PROVIDERS } = require('../../constants/constants');

require('./centsCustomers');

factory.define(FACTORIES_NAMES.paymentMethod, PaymentMethod, {
    centsCustomerId: factory.assoc(FACTORIES_NAMES.centsCustomer, 'id'),
    provider: faker.random.word(),
    type: faker.random.word(),
    paymentMethodToken: faker.random.word(),
    isDeleted: false,
});

factory.extend(FACTORIES_NAMES.paymentMethod, FACTORIES_NAMES.paymentMethodStripe, {
    provider: PAYMENT_METHOD_PROVIDERS.STRIPE,
});

module.exports = exports = factory;
