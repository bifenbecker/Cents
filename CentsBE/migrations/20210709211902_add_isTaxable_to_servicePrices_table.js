exports.up = function (knex) {
    return knex.schema.alterTable('servicePrices', function (table) {
        table.boolean('isTaxable').defaultTo(false);
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('servicePrices', function (table) {
        table.dropColumn('isTaxable');
    });
};
