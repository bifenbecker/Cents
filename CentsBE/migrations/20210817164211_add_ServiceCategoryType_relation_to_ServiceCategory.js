exports.up = function (knex) {
  return knex.schema.alterTable('serviceCategories', function (table) {
    table.integer('serviceCategoryTypeId');
    table.foreign('serviceCategoryTypeId').references('id').inTable('serviceCategoryTypes');
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('serviceCategories', function (table) {
    table.dropColumn('serviceCategoryTypeId');
  })
};
