exports.up = function (knex) {
    return knex.schema.createTable('serviceReferenceItemDetails', function (table) {
        table.increments('id');
        table.integer('serviceReferenceItemId').notNullable();
        table.foreign('serviceReferenceItemId').references('id').inTable('serviceReferenceItems');
        table.integer('soldItemId').notNullable();
        table.string('soldItemType').notNullable();
        table.string('lineItemName').notNullable();
        table.string('lineItemDescription').nullable();
        table.float('lineItemTotalCost').notNullable();
        table.float('lineItemQuantity').notNullable().defaultTo(0);
        table.float('lineItemUnitCost').notNullable();
        table.float('lineItemMinPrice').nullable();
        table.float('lineItemMinQuantity').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceReferenceItemDetails');
};
