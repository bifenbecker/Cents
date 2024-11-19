const { factory } = require('factory-girl');
const TurnLineItem = require('../../models/turnLineItems');
const faker = require('faker');
const { FACTORIES_NAMES } = require('../constants/factoriesNames');
require('./turns');

factory.define(FACTORIES_NAMES.turnLineItem, TurnLineItem, {
    turnId: factory.assoc(FACTORIES_NAMES.turn, 'id'),
    unitPriceInCents: faker.random.number(),
    quantity: faker.random.number(),
});

module.exports = exports = factory;
