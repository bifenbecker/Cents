const InventoryItem = require('../../../models/inventoryItem');

/**
 * When creating an order that includes an inventory item,
 * this function adjusts the count of the inventory
 * based on quantity purchased.
 *
 * @param {number} inventoryItemId
 * @param {number} count
 */
async function updateInventoryCount(inventoryItemId, count, trx) {
    const inventoryItem = await InventoryItem.query().findById(inventoryItemId);
    const currentCount = inventoryItem.quantity;

    return InventoryItem.query(trx)
        .patch({
            quantity: Number(currentCount - count),
        })
        .findById(inventoryItemId)
        .returning('*');
}

module.exports = exports = updateInventoryCount;
