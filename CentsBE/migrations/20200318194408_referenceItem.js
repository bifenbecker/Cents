exports.up = function (knex) {
    return knex.schema.createTable('referenceItems', function (table) {
        table.increments('id');
        table.integer('orderItemId').notNullable();
        table.foreign('orderItemId').references('id').inTable('orderItems');
        table.jsonb('machineDetails');
        table.integer('inventoryItemId');
        table.foreign('inventoryItemId').references('id').inTable('inventoryItems');
        table.integer('priceId');
        table.foreign('priceId').references('id').inTable('prices');
        table.integer('quantity');
        table.timestamp('startedAt');
        table.timestamp('completedAt');
        table.float('price', 6, 2);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('referenceItems');
};
