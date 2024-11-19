exports.up = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.boolean('isTaxable').defaultTo(true);
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('inventoryItems', function (table) {
        table.dropColumn('isTaxable');
    });
};
