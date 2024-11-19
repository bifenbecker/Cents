exports.up = function (knex) {
    return knex.schema.alterTable('turns', (table) => {
        table.timestamp('deletedAt').defaultTo(null);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('turns', function (table) {
        table.dropColumn('deletedAt');
    });
};
