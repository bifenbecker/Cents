const { factory } = require('factory-girl');
const EsdReader = require('../../models/esdReader');
require('./stores');

factory.define('esdReader', EsdReader, {
    storeId: factory.assoc('store', 'id'),
    esdLocationId: factory.chance('string', { length: 10 }),
    deviceSerialNumber: factory.chance('integer', { min: 100000, max: 9999999 }),
});

module.exports = exports = factory;
