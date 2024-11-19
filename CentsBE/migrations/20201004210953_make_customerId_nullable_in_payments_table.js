exports.up = function (knex) {
    return knex.schema.alterTable('payments', function (table) {
        table.integer('customerId').nullable().alter();
    });
};

exports.down = function (knex) {
    // adding notNull() constraint back will fail the down part.
    Promise.resolve();
};
