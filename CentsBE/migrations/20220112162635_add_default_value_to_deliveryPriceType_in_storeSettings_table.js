
exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.string('deliveryPriceType').defaultTo('RETAIL').alter();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
      table.string('deliveryPriceType').defaultTo(null).alter();
    });
  };
  