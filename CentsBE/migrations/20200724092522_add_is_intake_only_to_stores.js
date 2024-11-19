exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.boolean('isIntakeOnly').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('isIntakeOnly');
    });
};
