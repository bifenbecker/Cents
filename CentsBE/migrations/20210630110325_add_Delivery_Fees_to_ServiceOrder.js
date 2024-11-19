exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.double('pickupDeliveryFee', 6, 2).defaultTo(0.0);
        table.double('pickupDeliveryTip', 6, 2).defaultTo(0.0);
        table.double('returnDeliveryFee', 6, 2).defaultTo(0.0);
        table.double('returnDeliveryTip', 6, 2).defaultTo(0.0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('pickupDeliveryFee');
        table.dropColumn('pickupDeliveryTip');
        table.dropColumn('returnDeliveryFee');
        table.dropColumn('returnDeliveryTip');
    });
};
