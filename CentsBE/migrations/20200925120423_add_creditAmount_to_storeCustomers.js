exports.up = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.float('creditAmount');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.dropColumn('creditAmount');
    });
};
