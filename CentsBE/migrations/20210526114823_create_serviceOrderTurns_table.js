exports.up = function (knex) {
    return knex.schema.createTable('serviceOrderTurns', function (table) {
        table.increments('id');
        table.integer('serviceOrderId').notNullable();
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.integer('turnId').notNullable();
        table.foreign('turnId').references('id').inTable('turns');
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceOrderTurns');
};
