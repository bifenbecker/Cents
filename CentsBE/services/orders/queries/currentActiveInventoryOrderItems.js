const { raw } = require('objection');
const InventoryOrderItems = require('../../../models/inventoryOrderItems');

async function getItems(inventoryOrderId, transaction) {
    const items = await InventoryOrderItems.query(transaction)
        .select(
            'inventoryOrderLineItems.id as id',
            'lineItemTotalCost as totalCost',
            'lineItemTax as tax',
            'inventoryItems.inventoryId as inventoryMasterId',
            raw('sum("lineItemTotalCost") over() as "orderTotal"'),
        )
        .join('inventoryItems', (builder) => {
            builder
                .on('inventoryItems.id', 'inventoryOrderLineItems.inventoryItemId')
                .andOn('inventoryOrderLineItems.inventoryOrderId', '=', raw(`${inventoryOrderId}`));
        });
    return items;
}

module.exports = exports = getItems;
