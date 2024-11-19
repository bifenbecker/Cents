exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.string('paymentStatus');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('paymentStatus');
    });
};
