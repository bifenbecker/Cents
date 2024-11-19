exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.string('deliveryProvider').defaultTo('UBER').notNullable().alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.string('deliveryProvider').notNullable().alter();
    });
};
