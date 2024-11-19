exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.boolean('offerDryCleaningForDelivery').defaultTo(false);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('offerDryCleaningForDelivery');
    });
  };
  