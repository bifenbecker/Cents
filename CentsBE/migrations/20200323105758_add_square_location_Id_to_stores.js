exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.string('squareLocationId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('squareLocationId');
    });
};
