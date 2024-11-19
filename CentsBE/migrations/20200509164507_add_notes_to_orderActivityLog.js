exports.up = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderActivityLog', function (table) {
        table.dropColumn('notes');
    });
};
