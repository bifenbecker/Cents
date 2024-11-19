exports.up = function (knex) {
    return knex.schema.alterTable('inventoryOrders', function (table) {
        table.string('paymentStatus').defaultTo('BALANCE_DUE').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('inventoryOrders', function (table) {
        table.string('paymentStatus').defaultTo(null).alter();
    });
};
