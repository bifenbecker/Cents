/*TODO Remove not nullable constraint from user Id. -> Create a new Migration. */
exports.up = function (knex) {
    return knex.schema.createTable('orders', function (table) {
        table.increments('id');
        table.integer('userId').notNullable();
        table.foreign('userId').references('id').inTable('users');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.string('status');
        table.float('orderTotal');
        table.timestamp('placedAt').defaultTo(knex.fn.now());
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orders');
};
