exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.dropColumn('deletedAt');
    });
};
