exports.up = function (knex) {
    return knex.schema.alterTable('orders', function (table) {
        table.dropColumn('orderCode');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orders', function (table) {
        table.integer('orderCode');
    });
};
