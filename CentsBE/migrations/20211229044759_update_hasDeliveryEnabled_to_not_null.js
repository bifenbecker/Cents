exports.up = function (knex) {
    return knex.schema.alterTable('stores', (table) => {
        table.boolean('hasDeliveryEnabled').notNullable().defaultTo(false).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('stores', (table) => {
        table.boolean('hasDeliveryEnabled').nullable().alter();
    });
};
