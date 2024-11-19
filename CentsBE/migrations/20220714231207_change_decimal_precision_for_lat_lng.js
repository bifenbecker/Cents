exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.decimal('lat', 12, 10).alter();
        table.decimal('lng', 13, 10).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.real('lat');
        table.real('lng');
    });
};