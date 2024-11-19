exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('userId').nullable().alter();
    });
};

exports.down = function (knex) {
    // adding back notNull clause will fail the down part.
    Promise.resolve();
};
