exports.up = function (knex) {
  return knex.schema.alterTable('serviceOrders', function (table) {
      table.boolean('hasDryCleaning').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('serviceOrders', function (table) {
      table.dropColumn('hasDryCleaning');
  });
};
