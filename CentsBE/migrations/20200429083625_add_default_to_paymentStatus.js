exports.up = function (knex) {
    return knex.schema.alterTable('orders', function (table) {
        table.string('paymentStatus').defaultTo('UNPAID').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orders', function (table) {
        table.string('paymentStatus').defaultTo(null).alter();
    });
};
