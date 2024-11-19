const { factory } = require('factory-girl');
const StoreTheme = require('../../models/storeTheme');

require('./stores');
require('./laundromatBusinesses');

factory.define('storeTheme', StoreTheme, {
    storeId: factory.assoc('store', 'id'),
    businessId: factory.assoc('laundromatBusiness', 'id'),
});

module.exports = exports = factory;
