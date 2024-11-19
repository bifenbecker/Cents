const InventoryItem = require('../../models/inventoryItem');

/**
 * Retrieve the current quantity of an InventoryItem
 *
 * @param {Object} payload
 */
async function retrieveCurrentInventoryItemQuantity(payload) {
    try {
        const newPayload = payload;
        const { transaction, inventoryItemId } = newPayload;

        const inventoryItem = await InventoryItem.query(transaction).findById(inventoryItemId);

        newPayload.inventoryItem = inventoryItem;
        newPayload.currentInventoryItemQuantity = inventoryItem.quantity;
        newPayload.storeId = inventoryItem.storeId;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = retrieveCurrentInventoryItemQuantity;
