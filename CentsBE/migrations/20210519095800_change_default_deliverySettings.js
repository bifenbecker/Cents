exports.up = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.string('hasDeliveryEnabled').defaultTo(true).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('stores', function (table) {
        table.string('hasDeliveryEnabled').defaultTo(false).alter();
    });
};
