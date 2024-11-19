exports.up = function (knex) {
    return knex.schema.table('servicesMaster', function (table) {
        table.boolean('isArchived').defaultTo(false);
        table.timestamp('archivedAt').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('servicesMaster', function (table) {
        table.dropColumn('isArchived');
        table.dropColumn('archivedAt');
    });
};
