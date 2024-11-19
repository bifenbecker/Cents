exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('notes');
    });
};
