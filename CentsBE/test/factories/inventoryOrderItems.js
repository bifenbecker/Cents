const { factory } = require('factory-girl');
const InventoryOrderItems = require('../../models/inventoryOrderItems');
require('./inventoryOrders');
require('./inventoryItems');

factory.define('inventoryOrderItem', InventoryOrderItems, {
    lineItemCost: 10,
    inventoryItemId: factory.assoc('inventoryItem', 'id'),
    inventoryOrderId: factory.assoc('inventoryOrder', 'id'),
    lineItemQuantity: 4,
});

module.exports = exports = factory;
