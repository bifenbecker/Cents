exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.integer('orderId');
        table.foreign('orderId').references('id').inTable('orders');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropForeign('orderId');
        table.dropColumn('orderId');
    });
};
