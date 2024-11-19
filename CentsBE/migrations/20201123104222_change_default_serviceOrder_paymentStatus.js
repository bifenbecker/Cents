exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.string('paymentStatus').defaultTo('BALANCE_DUE').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.string('paymentStatus').defaultTo('UNPAID').alter();
    });
};
