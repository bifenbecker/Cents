exports.up = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.string('rack');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orders', function (table) {
        table.dropColumn('rack');
    });
};
