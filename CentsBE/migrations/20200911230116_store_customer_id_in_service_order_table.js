exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('storeCustomerId');
        table.foreign('storeCustomerId').references('id').inTable('storeCustomers');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('storeCustomerId');
    });
};
