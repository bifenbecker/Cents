const { factory } = require('factory-girl');
const InventoryCategory = require('../../models/inventoryCategory');
require('./laundromatBusinesses');

factory.define('inventoryCategory', InventoryCategory, {
    businessId: factory.assoc('laundromatBusiness', 'id'),
    name: 'powder',
});

module.exports = exports = factory;
