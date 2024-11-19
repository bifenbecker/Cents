exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.specificType('deliveryWindow', 'bigint ARRAY');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.dropColumn('deliveryWindow');
    });
};
