exports.up = function (knex) {
    return knex.schema.table('inventoryOrders', function (table) {
        table.float('convenienceFee', 6, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventoryOrders', function (table) {
        table.dropColumn('convenienceFee');
    });
};
