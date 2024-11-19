
exports.up = function (knex) {
  return knex.schema.createTable('servicePricingStructure', function (table) {
      table.increments('id');
      table.enum('type', ['FIXED_PRICE', 'PER_POUND']);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('servicePricingStructure');
};
