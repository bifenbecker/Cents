const { factory } = require('factory-girl');
const Shifts = require('../../models/shifts');
const faker = require('faker');
require('./stores');
const { FACTORIES_NAMES: FN } = require('../constants/factoriesNames');

factory.define('shift', Shifts, {
    name: faker.random.word(),
    storeId: factory.assoc('store', 'id'),
    type: 'SHIFT',
});

factory.extend(FN.shift, FN.ownDeliveryShift, {
    type: 'OWN_DELIVERY'
})

module.exports = exports = factory;
