
exports.up = function (knex) {
  return knex.schema.createTable('serviceCategoryTypes', function (table) {
      table.increments('id');
      table.enum('type', ['LAUNDRY', 'DRY_CLEANING', 'ALTERATIONS']);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('serviceCategoryTypes');
};
