exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.string('paymentToken');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('paymentToken');
    });
};
