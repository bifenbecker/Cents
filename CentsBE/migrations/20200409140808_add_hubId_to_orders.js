exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.integer('hubId');
        table.foreign('hubId').references('id').inTable('stores');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropForeign('hubId');
        table.dropColumn('hubId');
    });
};
