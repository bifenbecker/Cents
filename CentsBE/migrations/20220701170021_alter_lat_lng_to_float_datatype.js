
exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.float('lat', 14, 10).alter();
        table.float('lng', 14, 10).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.real('lat');
        table.real('lng');
    });
};
