exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('taxAmountInCents').defaultTo(0);
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('taxAmountInCents');
    });
};
