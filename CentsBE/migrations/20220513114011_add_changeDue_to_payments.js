exports.up = function (knex) {
    return knex.schema.alterTable('payments', function (table) {
        table.float('changeDue', 6, 2).defaultTo(0.0);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('payments', function (table) {
        table.dropColumn('changeDue');
    });
};
