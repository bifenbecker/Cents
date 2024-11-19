exports.up = function (knex) {
    return knex.schema.alterTable('inventoryOrders', function (table) {
        table.integer('salesTaxAmount').defaultTo(0).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('inventoryOrders', function (table) {
        table.float('salesTaxAmount', 6, 2).alter();
    });
};
