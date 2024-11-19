exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.integer('orderId').nullable().alter();
        table.dropForeign('orderId');
        table.renameColumn('orderId', 'serviceOrderId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.renameColumn('serviceOrderId', 'orderId');
        table.foreign('orderId').references('id').inTable('serviceOrders');
    });
};
