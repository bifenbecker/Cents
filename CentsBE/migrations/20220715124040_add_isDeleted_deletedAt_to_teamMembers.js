exports.up = function (knex) {
    return knex.schema.alterTable('teamMembers', function (table) {
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt');

    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('teamMembers', function (table) {
        table.dropColumn('isDeleted');
        table.dropColumn('deletedAt');
    });
};