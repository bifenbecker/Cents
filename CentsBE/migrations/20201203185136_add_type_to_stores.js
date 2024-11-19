exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('type');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('type');
    });
};
