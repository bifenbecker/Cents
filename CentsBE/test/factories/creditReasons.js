const { factory } = require('factory-girl');
const CreditReason = require('../../models/creditReasons');
const faker = require('faker');

factory.define('creditReason', CreditReason, {
    reason: 'Customer Service',
});

module.exports = exports = factory;
