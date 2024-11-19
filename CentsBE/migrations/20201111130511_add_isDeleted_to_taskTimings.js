exports.up = function (knex) {
    return knex.schema.alterTable('taskTimings', function (table) {
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').nullable().defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('taskTimings', function (table) {
        table.dropColumn('isDeleted');
        table.dropColumn('deletedAt');
    });
};
