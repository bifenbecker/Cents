const TARGET_TABLE_NAME = 'businessCustomers';
const NEW_COLUMN_NAME = 'isInvoicingEnabled';

exports.up = function (knex) {
  return knex.schema.table(TARGET_TABLE_NAME, function (table) {
      table.boolean(NEW_COLUMN_NAME).defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TARGET_TABLE_NAME, function (table) {
      table.dropColumn(NEW_COLUMN_NAME);
  });
};
