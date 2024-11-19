const { factory } = require('factory-girl');
const InventoryChangeLog = require('../../models/inventoryChangeLog');

require('./inventoryItems');
require('./laundromatBusinesses');
require('./stores');
require('./orders');
require('./teamMembers');

factory.define('inventoryChangeLog', InventoryChangeLog, {
    inventoryItemId: factory.assoc('inventoryItem', 'id'),
    businessId: factory.assoc('laundromatBusiness', 'id'),
    storeId: factory.assoc('store', 'id'),
    orderId: factory.assoc('order', 'id'),
    teamMemberId: factory.assoc('teamMember', 'id'),
    amountChanged: -1,
    entryPoint: 'SERVICE_ORDER_SALE',
});

factory.extend('inventoryChangeLog', 'inventorySale', {
    entryPoint: 'INVENTORY_ORDER_SALE',
});

module.exports = exports = factory;
