exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.string('orderCode');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('orderCode');
    });
};
