
exports.up = async function(knex) {
  await Promise.all([
      knex.schema.table('serviceOrders', function (table) {
        table.index(['storeCustomerId']);
      }),
      knex.schema.table('serviceOrders', function (table) {
        table.index(['status']);
      }),
      knex.schema.table('serviceOrders', function (table) {
        table.index(['orderCode']);
      }),
      knex.schema.table('inventoryOrders', function (table) {
        table.index(['status']);
      }),
      knex.schema.table('inventoryOrders', function (table) {
        table.index(['orderCode']);
      }),
  ])
};

exports.down = async function(knex) {
  await Promise.all([
    knex.schema.table('serviceOrders', function (table) {
      table.dropIndex(['storeCustomerId']);
    }),
    knex.schema.table('serviceOrders', function (table) {
      table.dropIndex(['status']);
    }),
    knex.schema.table('serviceOrders', function (table) {
      table.dropIndex(['orderCode']);
    }),
    knex.schema.table('inventoryOrders', function (table) {
      table.dropIndex(['status']);
    }),
    knex.schema.table('inventoryOrders', function (table) {
      table.dropIndex(['orderCode']);
    }),
  ])
};