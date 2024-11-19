exports.up = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.boolean('hasDeliveryEnabled').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.dropColumn('hasDeliveryEnabled');
    });
};
