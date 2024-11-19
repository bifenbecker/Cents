const { factory } = require('factory-girl');
const faker = require('faker');
const BusinessCustomerPreferences = require('../../models/businessCustomerPreferences');

// factory associations
require('./laundromatBusinesses');

factory.define('businessCustomerPreferences', BusinessCustomerPreferences, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    type: faker.random.arrayElement(["multi", "single"]),
    fieldName: factory.chance('word'),
});

module.exports = exports = factory;
