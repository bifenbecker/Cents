exports.up = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.boolean('hasCashEnabled').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.dropColumn('hasCashEnabled');
    });
};
