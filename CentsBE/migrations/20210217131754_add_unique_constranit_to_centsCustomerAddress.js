exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (t) {
        t.unique(['googlePlacesId', 'centsCustomerId']);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsCustomerAddresses', function (table) {
        table.dropUnique(['googlePlacesId', 'centsCustomerId']);
    });
};
