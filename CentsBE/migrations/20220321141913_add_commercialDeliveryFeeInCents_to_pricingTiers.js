exports.up = function (knex) {
    return knex.schema.alterTable('pricingTiers', function (table) {
        table.integer('commercialDeliveryFeeInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('pricingTiers', function (table) {
        table.dropColumn('commercialDeliveryFeeInCents');
    });
};
