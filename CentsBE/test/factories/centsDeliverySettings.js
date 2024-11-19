const { factory } = require('factory-girl');
const centsDeliverySettings = require('../../models/centsDeliverySettings');
require('./stores');

factory.define('centsDeliverySettings', centsDeliverySettings, {
    storeId: factory.assoc('store', 'id'),
});

module.exports = exports = factory;
