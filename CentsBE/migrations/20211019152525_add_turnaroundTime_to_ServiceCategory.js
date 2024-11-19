exports.up = function (knex) {
  return knex.schema.alterTable('serviceCategories', function (table) {
    table.integer('turnAroundInHours').defaultTo(24);
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('serviceCategories', function (table) {
    table.integer('turnAroundInHours');
  })
};
