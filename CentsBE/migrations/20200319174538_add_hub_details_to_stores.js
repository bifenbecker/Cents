exports.up = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.boolean('isHub').defaultTo(false);
        table.integer('hubId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('stores', function (table) {
        table.dropColumn('isHub');
        table.dropColumn('hubId');
    });
};
