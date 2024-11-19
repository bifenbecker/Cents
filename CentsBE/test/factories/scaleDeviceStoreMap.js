const { factory } = require('factory-girl');
const ScaleDeviceStoreMap = require('../../models/scaleDeviceStoreMap');
require('./stores');
require('./scaleDevice');

factory.define('scaleDeviceStoreMap', ScaleDeviceStoreMap, {
    storeId: factory.assoc('store', 'id'),
    scaleDeviceId: factory.assoc('scaleDevice', 'id'),
});

module.exports = exports = factory;
