exports.up = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.dropColumn('manufacturer');
    });
};

exports.down = function (knex) {
    return knex.schema.table('machines', function (table) {
        table.string('manufacturer');
    });
};
