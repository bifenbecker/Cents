const InventoryItem = require('../../models/inventoryItem');

/**
 * Retrieve the current quantity of an InventoryItem
 *
 * @param {Object} payload
 */
async function updateInventoryItem(payload) {
    try {
        const newPayload = payload;
        const { transaction, inventoryItemId, field, value } = newPayload;

        const updatedProduct = await InventoryItem.query(transaction)
            .patch({
                [field]: value,
                updatedAt: new Date().toISOString,
            })
            .findById(inventoryItemId)
            .returning('*');

        newPayload.updatedProduct = updatedProduct;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateInventoryItem;
