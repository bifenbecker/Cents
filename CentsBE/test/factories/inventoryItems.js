const { factory } = require('factory-girl');
const InventoryItem = require('../../models/inventoryItem');
require('./stores');
require('./inventories');

factory.define('inventoryItem', InventoryItem, {
    storeId: factory.assoc('store', 'id'),
    price: 10,
    quantity: 1,
    inventoryId: factory.assoc('inventory', 'id'),
});

factory.extend('inventoryItem', 'pricingTierInventoryItem', {
    pricingTierId: factory.assoc('pricingTiers', 'id'),
});

module.exports = exports = factory;
