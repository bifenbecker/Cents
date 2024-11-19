exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.timestamp('completedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('completedAt');
    });
};
