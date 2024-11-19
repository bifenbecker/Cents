exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.string('paymentTiming').defaultTo('PRE-PAY');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('paymentTiming');
    });
};
