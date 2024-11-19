exports.up = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.boolean('hasEsdEnabled').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.dropColumn('hasEsdEnabled');
    });
};
