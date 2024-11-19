exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.boolean('offersFullService').defaultTo('false');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('offersFullService');
    });
};
