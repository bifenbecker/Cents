exports.up = function (knex) {
    return knex.schema.table('shifts', function (table) {
        table.timestamp('deletedAt').defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.table('shifts', function (table) {
        table.dropColumn('deletedAt');
    });
};
