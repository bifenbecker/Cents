const { raw } = require('objection');
const Store = require('../../models/store');
const InventoryItems = require('../../models/inventoryItem');
const InventoryChangeLog = require('../../models/inventoryChangeLog');

/**
 * Determine the proper reason for the InventoryChangeLog
 *
 * @param {String} orderableType
 */
async function determineChangeLogReason(orderableType) {
    if (orderableType === 'InventoryOrder') {
        return 'INVENTORY_ORDER_SALE';
    }
    return 'SERVICE_ORDER_SALE';
}

/**
 * Update the count of the InventoryItem and create new InventoryChangeLog
 *
 * @param {Object} item
 * @param {Object} order
 * @param {void} transaction
 */
async function updateInventoryItemCounts(item, order, transaction) {
    const currentItem = await InventoryItems.query().findById(item.inventoryItemId);
    const { quantity } = currentItem;

    await InventoryItems.query(transaction)
        .patch({
            quantity: raw(`quantity + ${item.changeInQuantity}`),
        })
        .findById(item.inventoryItemId);

    const { orderableType, storeId } = order;
    const reason = await determineChangeLogReason(orderableType);

    const store = await Store.query(transaction)
        .withGraphFetched('laundromatBusiness')
        .findById(storeId);

    await InventoryChangeLog.query(transaction).insert({
        inventoryItemId: item.inventoryItemId,
        amountChanged: item.changeInQuantity,
        storeId,
        entryPoint: orderableType,
        orderId: order.id,
        businessId: store.laundromatBusiness.id,
        reason,
        startingAmount: quantity,
        endingAmount: Number(quantity + item.changeInQuantity),
    });
}

/**
 * Update the InventoryItem and InventoryChangeLog for the given order
 *
 * @param {Object} order
 * @param {Array} items
 * @param {void} transaction
 */
async function updateInventory(order, items, transaction) {
    const updatedItems = items.map((item) => updateInventoryItemCounts(item, order, transaction));
    await Promise.all(updatedItems);
}

module.exports = exports = updateInventory;
