const { factory } = require('factory-girl');
const faker = require('faker');
const ServiceReferenceItemModifiers = require('../../models/serviceReferenceItemModifiers');
require('./serviceReferenceItems');
require('./serviceModifiers');

factory.define('serviceReferenceItemModifiers', ServiceReferenceItemModifiers, {
    serviceReferenceItemId: factory.assoc('serviceReferenceItem', 'id'),
    serviceModifierId: factory.assoc('serviceModifier', 'id'),
    modifierName: faker.random.word(),
    modifierDescription: faker.random.word(),
    modifierPrice: 10,
});

module.exports = exports = factory;