exports.up = function (knex) {
    return knex.schema.createTable('inventoryOrderLineItems', function (table) {
        table.increments('id');
        table.integer('inventoryOrderId').notNullable();
        table.foreign('inventoryOrderId').references('id').inTable('inventoryOrders');
        table.integer('lineItemQuantity').notNullable();
        table.float('lineItemTotalCost', 6, 2);
        table.float('lineItemTax', 6, 2);
        table.integer('inventoryItemId').notNullable();
        table.foreign('inventoryItemId').references('id').inTable('inventoryItems');
        table.string('lineItemName');
        table.string('lineItemDescription');
        table.string('lineItemCategory');
        table.float('lineItemCost');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventoryOrderLineItems');
};
