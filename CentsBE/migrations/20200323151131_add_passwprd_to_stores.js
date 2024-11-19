exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('password');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('password');
    });
};
