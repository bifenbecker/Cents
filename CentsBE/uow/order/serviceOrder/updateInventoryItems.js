const updateInventory = require('../../../services/inventory/inventoryItems');

async function updateInventoryItems(payload) {
    const { order, inventoryOrderItems, transaction } = payload;
    if (inventoryOrderItems.length) {
        await updateInventory(order, inventoryOrderItems, transaction);
    }
    return payload;
}

module.exports = exports = updateInventoryItems;
