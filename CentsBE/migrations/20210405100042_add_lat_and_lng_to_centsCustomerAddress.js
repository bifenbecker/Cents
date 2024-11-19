exports.up = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.float('lat', 6, 2);
        table.float('lng', 6, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.dropColumn('lat');
        table.dropColumn('lng');
    });
};
