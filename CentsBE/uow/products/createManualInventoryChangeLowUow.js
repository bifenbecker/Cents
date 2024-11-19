const InventoryChangeLog = require('../../models/inventoryChangeLog');

/**
 * Create an InventoryChangeLog entry
 *
 * @param {Object} payload
 */
async function createManualInventoryChangeLog(payload) {
    try {
        const newPayload = payload;
        const {
            transaction,
            inventoryItemId,
            currentInventoryItemQuantity,
            businessId,
            storeId,
            field,
            value,
        } = newPayload;

        if (field !== 'quantity') {
            return newPayload;
        }

        const amountChanged = Number(value - currentInventoryItemQuantity);
        const inventoryChangeLog = await InventoryChangeLog.query(transaction).insert({
            inventoryItemId,
            businessId,
            storeId,
            reason: 'MANUAL_ENTRY',
            entryPoint: 'BusinessManager',
            amountChanged,
            startingAmount: currentInventoryItemQuantity,
            endingAmount: value,
        });

        newPayload.inventoryChangeLog = inventoryChangeLog;
        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = createManualInventoryChangeLog;
