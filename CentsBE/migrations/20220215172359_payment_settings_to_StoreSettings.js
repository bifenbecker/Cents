exports.up = function (knex) {
  return knex.schema.alterTable('storeSettings', function (table) {
      table.string('onPremisePaymentProvider').defaultTo('STRIPE').notNullable();
      table.string('onPremiseConnectivityMethod').defaultTo('LOCAL_NETWORK').notNullable();
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable('storeSettings', function (table) {
      table.dropColumn('onPremisePaymentProvider');
      table.dropColumn('onPremiseConnectivityMethod');
  });
};
