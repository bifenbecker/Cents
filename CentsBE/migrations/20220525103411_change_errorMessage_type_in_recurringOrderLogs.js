exports.up = function (knex) {
  return knex.schema.alterTable('recurringOrderLogs', function (table) {
      table.text('errorMessage').alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('recurringOrderLogs', function (table) {
      table.string('errorMessage').alter();
  });
};
