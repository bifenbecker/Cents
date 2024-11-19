exports.up = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.string('origin');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.dropColumn('origin');
    });
};
