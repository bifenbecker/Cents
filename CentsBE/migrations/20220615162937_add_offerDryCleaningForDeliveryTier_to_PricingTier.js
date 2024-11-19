exports.up = function (knex) {
    return knex.schema.alterTable('pricingTiers', function (table) {
        table.boolean('offerDryCleaningForDeliveryTier').defaultTo(false);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('pricingTiers', function (table) {
        table.dropColumn('offerDryCleaningForDeliveryTier');
    });
  };
  