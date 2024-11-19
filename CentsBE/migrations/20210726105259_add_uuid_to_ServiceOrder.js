exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.uuid('uuid');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('uuid');
    });
};
