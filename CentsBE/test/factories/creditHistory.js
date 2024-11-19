const { factory } = require('factory-girl');
const CreditHistory = require('../../models/creditHistory');
require('./centsCustomers');
require('./laundromatBusinesses');
require('./creditReasons');

factory.define('creditHistory', CreditHistory, {
    customerId: factory.assoc('centsCustomer', 'id'),
    reasonId: factory.assoc('creditReason', 'id'),
    businessId: factory.assoc('laundromatBusiness', 'id'),
    amount: 10,
});

module.exports = exports = factory;
