exports.up = function (knex) {
    return knex.schema.createTable('turnLineItems', function (table) {
        table.increments('id');
        table.integer('turnId').notNullable();
        table.foreign('turnId').references('id').inTable('turns');
        table.integer('unitPriceInCents');
        table.string('turnTime');
        table.integer('quantity');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('turnLineItems');
};
