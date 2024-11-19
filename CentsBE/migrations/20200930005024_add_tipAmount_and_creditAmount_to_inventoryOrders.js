exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.float('tipAmount', 6, 2);
        table.float('creditAmount', 6, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('tipAmount');
        table.dropColumn('creditAmount');
    });
};
