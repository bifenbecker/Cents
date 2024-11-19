const { factory } = require('factory-girl');
const CentsCustomerAddress = require('../../models/centsCustomerAddress');
const faker = require('faker');
require('./centsCustomers');

factory.define('centsCustomerAddress', CentsCustomerAddress, {
    address1: factory.chance('address'),
    city: factory.chance('city', { country: 'us' }),
    firstLevelSubdivisionCode: faker.address.countryCode(),
    postalCode: faker.address.zipCode(),
    countryCode: 'US',
    centsCustomerId: factory.assoc('centsCustomer', 'id'),
});

module.exports = exports = factory;
