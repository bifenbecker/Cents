const InventoryOrderItems = require('../../../../models/inventoryOrderItems');

async function getInventoryOrderItems(inventoryOrderId, transaction) {
    const items = await InventoryOrderItems.query(transaction)
        .select('lineItemQuantity as changeInQuantity', 'inventoryItemId')
        .where({
            inventoryOrderId,
        });
    return items;
}

module.exports = exports = getInventoryOrderItems;
