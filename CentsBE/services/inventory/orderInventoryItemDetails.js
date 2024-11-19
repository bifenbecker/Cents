const serviceOrderItem = require('../../models/serviceOrderItem');

function orderInventoryItemDetails(orderId, inventoryItemId, transaction) {
    return serviceOrderItem
        .query(transaction)
        .findOne({
            orderId,
        })
        .withGraphJoined('referenceItems')
        .where('referenceItems.inventoryItemId', inventoryItemId);
}

module.exports = exports = orderInventoryItemDetails;
