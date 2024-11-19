exports.up = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.integer('centsCustomerAddressId');
        table.foreign('centsCustomerAddressId').references('id').inTable('centsCustomerAddresses');
        table.integer('timingsId');
        table.foreign('timingsId').references('id').inTable('timings');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderDeliveries', function (table) {
        table.dropColumn('centsCustomerAddressId');
        table.dropForeign('centsCustomerAddressId');
        table.dropColumn('timingsId');
        table.dropForeign('timingsId');
    });
};
