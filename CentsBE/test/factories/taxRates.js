const { factory } = require('factory-girl');
const TaxRate = require('../../models/taxRate');
const faker = require('faker');
require('./laundromatBusinesses');

factory.define('taxRate', TaxRate, {
    name: faker.random.word(),
    taxAgency: faker.phone.phoneNumberFormat().split('-').join(''),
    rate: Math.floor(Math.random() * 12),
    businessId: factory.assoc('laundromatBusiness', 'id'),
});

module.exports = exports = factory;
