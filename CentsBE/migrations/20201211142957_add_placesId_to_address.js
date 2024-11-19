exports.up = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.string('googlePlacesId');
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.dropColumn('googlePlacesId');
    });
};
