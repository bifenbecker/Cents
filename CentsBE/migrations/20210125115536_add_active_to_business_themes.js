exports.up = function (knex) {
    return knex.schema.table('businessThemes', function (table) {
        table.boolean('active').defaultTo(true);
    });
};

exports.down = function (knex) {
    return knex.schema.table('businessThemes', function (table) {
        table.dropColumn('active');
    });
};
