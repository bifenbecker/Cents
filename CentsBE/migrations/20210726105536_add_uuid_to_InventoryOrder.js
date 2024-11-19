exports.up = function (knex) {
    return knex.schema.table('inventoryOrders', function (table) {
        table.uuid('uuid');
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventoryOrders', function (table) {
        table.dropColumn('uuid');
    });
};
