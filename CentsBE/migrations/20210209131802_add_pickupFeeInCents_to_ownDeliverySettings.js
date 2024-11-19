exports.up = function (knex) {
    return knex.schema.table('ownDeliverySettings', function (table) {
        table.integer('pickupFeeInCents').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('ownDeliverySettings', function (table) {
        table.dropColumn('pickupFeeInCents');
    });
};
