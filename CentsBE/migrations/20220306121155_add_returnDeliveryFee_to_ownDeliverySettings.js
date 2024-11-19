exports.up = function (knex) {
    return knex.schema.table('ownDeliverySettings', (table) => {
        table.integer('returnDeliveryFeeInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.table('ownDeliverySettings', (table) => {
        table.dropColumn('returnDeliveryFeeInCents');
    });
};
