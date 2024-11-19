const { factory } = require('factory-girl');
const PrinterStoreSetting = require('../../models/printerStoreSettings');
require('./stores');

factory.define('printerStoreSetting', PrinterStoreSetting, {
    brand: 'Brand',
    connectivityType: 'Default',
    storeId: factory.assoc('store', 'id'),
});

module.exports = exports = factory;
