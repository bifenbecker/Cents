const { factory } = require('factory-girl');
const Payments = require('../../models/payment');
const faker = require('faker');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

require('./users');
factory.define(FN.payment, Payments, {
    customerId: factory.assoc(FN.user, 'id'),
    orderId: factory.assoc(FN.order, 'id'),
    storeId: factory.assoc(FN.store, 'id'),
    status: faker.random.word(),
    totalAmount: faker.finance.amount(),
    transactionFee: faker.commerce.price(),
    tax: faker.commerce.price(),
    paymentToken: faker.random.word(),
    stripeClientSecret: faker.internet.password(),
    currency: faker.finance.currencyName(),
    destinationAccount: faker.finance.account(),
    paymentProcessor: faker.finance.transactionType(),
    paymentMemo: faker.lorem.lines(1),
});

module.exports = exports = factory;
