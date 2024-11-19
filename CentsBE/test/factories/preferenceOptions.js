const { factory } = require('factory-girl');
const PreferenceOptions = require('../../models/preferenceOptions');

// factory associations
require('./businessCustomerPreferences');

factory.define('preferenceOptions', PreferenceOptions, {
    businessCustomerPreferenceId: factory.assoc('businessCustomerPreferences', 'id'),
    value: factory.chance('word'),
});

module.exports = exports = factory;
