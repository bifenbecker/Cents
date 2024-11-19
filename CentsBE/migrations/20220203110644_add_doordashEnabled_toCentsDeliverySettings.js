exports.up = function (knex) {
  return knex.schema.alterTable('centsDeliverySettings', function (table) {
      table.boolean('doorDashEnabled').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('centsDeliverySettings', function (table) {
      table.dropColumn('doorDashEnabled');
  });
};
