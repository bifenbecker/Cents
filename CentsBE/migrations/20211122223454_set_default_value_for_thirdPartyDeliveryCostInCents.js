exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.float('thirdPartyDeliveryCostInCents').defaultTo(0).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.float('thirdPartyDeliveryCostInCents').defaultTo(null).alter();
    });
};
