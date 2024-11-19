const { factory } = require('factory-girl');
const faker = require('faker');
const CentsCustomer = require('../../models/centsCustomer');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define(FN.centsCustomer, CentsCustomer, (buildOptions) => {
    let attr = {
        email: factory.sequence('User.email', (n) => `user-${n}@gmail.com`),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.phoneNumberFormat().split('-').join(''),
        password: 'abcd',
        languageId: factory.assoc('language', 'id'),
    };
    if (buildOptions.fullName) {
        attr.fullName = attr.firstName + ' ' + attr.lastName;
        delete attr.firstName;
        delete attr.lastName;
    }
    if (buildOptions.removePassword) {
        delete attr.password;
    }
    return attr;
});

factory.extend(FN.centsCustomer, FN.centsCustomerWithAddress, {
    addresses: factory.assocMany(FN.centsCustomerAddress, 1, 'id'),
});

module.exports = exports = factory;
