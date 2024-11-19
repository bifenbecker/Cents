const ServiceOrderItems = require('../../../../models/serviceOrderItem');

async function getInventoryItems(serviceOrderId, transaction) {
    const items = await ServiceOrderItems.query(transaction)
        .select(
            'serviceReferenceItems.inventoryItemId',
            'serviceReferenceItems.quantity as changeInQuantity',
        )
        .join('serviceReferenceItems', (builder) => {
            builder
                .on('serviceReferenceItems.orderItemId', 'serviceOrderItems.id')
                .onNull('serviceOrderItems.deletedAt')
                .andOn('serviceOrderItems.orderId', serviceOrderId);
        })
        .whereNot('serviceReferenceItems.inventoryItemId', null);
    return items;
}

module.exports = exports = getInventoryItems;
