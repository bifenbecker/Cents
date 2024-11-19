exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.integer('rating');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('rating');
    });
};
