exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.float('thirdPartyDeliveryCostInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.dropColumn('thirdPartyDeliveryCostInCents');
    });
};
