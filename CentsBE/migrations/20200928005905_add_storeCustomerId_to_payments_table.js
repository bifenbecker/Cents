exports.up = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.integer('storeCustomerId');
        table.foreign('storeCustomerId').references('id').inTable('storeCustomers');
    });
};

exports.down = function (knex) {
    return knex.schema.table('payments', function (table) {
        table.dropForeign('storeCustomerId');
        table.dropColumn('storeCustomerId');
    });
};
