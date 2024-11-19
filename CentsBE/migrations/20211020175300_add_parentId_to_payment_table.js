exports.up = function (knex) {
    return knex.schema.alterTable('payments', function (table) {
        table.integer('parentId');
        table.foreign('parentId').references('id').inTable('payments');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('payments', function (table) {
        table.dropColumn('parentId');
    });
};
