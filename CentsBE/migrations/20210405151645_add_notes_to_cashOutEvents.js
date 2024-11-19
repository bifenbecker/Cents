exports.up = function (knex) {
    return knex.schema.alterTable('cashOutEvents', function (table) {
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('cashOutEvents', function (table) {
        table.dropColumn('notes');
    });
};
