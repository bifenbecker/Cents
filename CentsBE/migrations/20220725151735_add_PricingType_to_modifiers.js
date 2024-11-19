exports.up = function (knex) {
    return knex.schema.alterTable('modifiers', function (table) {
        table.enum('pricingType', ['FIXED_PRICE', 'PER_POUND']).defaultTo('PER_POUND');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('modifiers', function (table) {
        table.dropColumn('pricingType');
    });
  };
  