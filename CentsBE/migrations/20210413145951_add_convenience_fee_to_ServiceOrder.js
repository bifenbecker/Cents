exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.float('convenienceFee', 6, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('convenienceFee');
    });
};
