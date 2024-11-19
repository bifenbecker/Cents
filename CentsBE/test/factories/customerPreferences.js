const { factory } = require('factory-girl');
const CustomerPreferences = require('../../models/customerPreferences');


// factory associations
require('./laundromatBusinesses');
require('./centsCustomers');
require('./customerPrefOptions');

factory.define('customerPreferences', CustomerPreferences, {
    customerId: factory.assoc('centsCustomer','id'),
    businessId: factory.assoc('laundromatBusiness', 'id'),
});
factory.extend('customerPreferences', CustomerPreferences, {
    optionId: factory.assoc('customerPrefOptions', 'id'),
});

module.exports = exports = factory;
