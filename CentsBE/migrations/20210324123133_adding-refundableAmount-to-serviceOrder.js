exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.float('refundableAmount').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('refundableAmount');
    });
};
