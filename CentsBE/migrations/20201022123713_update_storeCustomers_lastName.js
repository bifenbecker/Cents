exports.up = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.string('lastName').nullable().alter();
    });
};

exports.down = function (knex) {
    // adding notNull() constraint back will fail the down part.
    Promise.resolve();
};
