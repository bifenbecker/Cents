const { factory } = require('factory-girl');
const CustomerPreferencesOptionSelection = require('../../models/customerPreferencesOptionSelection');
require('./preferenceOptions');
require('./centsCustomers');

factory.define('customerPreferencesOptionSelection', CustomerPreferencesOptionSelection, {
    preferenceOptionId: factory.assoc('preferenceOptions', 'id'),
    centsCustomerId: factory.assoc('centsCustomer', 'id'),
});


module.exports = exports = factory;
