exports.up = function (knex) {
    return knex.schema.table('ownDeliverySettings', function (table) {
        table.renameColumn('deliverFeeInCents', 'deliveryFeeInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.table('ownDeliverySettings', function (table) {
        table.renameColumn('deliveryFeeInCents', 'deliverFeeInCents');
    });
};
