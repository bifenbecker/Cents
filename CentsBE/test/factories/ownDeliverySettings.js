const { factory } = require('factory-girl');
const OwnDeliverySettings = require('../../models/ownDeliverySettings');
require('./stores');

factory.define('ownDeliverySetting', OwnDeliverySettings, {
    hasZones: false,
    storeId: factory.assoc('store', 'id'),
});

module.exports = exports = factory;
