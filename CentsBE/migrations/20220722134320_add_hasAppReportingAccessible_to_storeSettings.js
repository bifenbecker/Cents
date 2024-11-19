
exports.up = function(knex) {
  return knex.schema.alterTable('storeSettings', function (table) {
    table.boolean('hasAppReportingAccessible').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('storeSettings', function (table) {
    table.dropColumn('hasAppReportingAccessible');
  });
};
