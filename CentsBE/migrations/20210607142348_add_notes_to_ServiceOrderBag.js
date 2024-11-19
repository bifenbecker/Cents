exports.up = function (knex) {
    return knex.schema.table('serviceOrderBags', function (table) {
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrderBags', function (table) {
        table.dropColumn('notes');
    });
};
