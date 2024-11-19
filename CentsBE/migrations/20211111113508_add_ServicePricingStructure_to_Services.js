exports.up = function (knex) {
  return knex.schema.alterTable('servicesMaster', function (table) {
    table.integer('servicePricingStructureId');
    table.foreign('servicePricingStructureId').references('id').inTable('servicePricingStructure');
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('servicesMaster', function (table) {
    table.dropColumn('servicePricingStructureId');
  })
};
