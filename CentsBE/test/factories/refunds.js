const { factory } = require('factory-girl');
const faker = require('faker');
const Refunds = require('../../models/refund');

require('./orders');
require('./payments');

factory.define('refunds', Refunds, {
    orderId: factory.assoc('order', 'id'),
    paymentId: factory.assoc('payments', 'id'),
    refundAmountInCents: faker.random.number(1000, 50000),
    thirdPartyRefundId: 're_3JShjKGuj5YLpJjF00voKs2V',
    refundProvider: 'stripe',
    status: 'succeeded',
    currency: 'usd',
    reason: 'REQUESTED_BY_CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
});

module.exports = exports = factory;
