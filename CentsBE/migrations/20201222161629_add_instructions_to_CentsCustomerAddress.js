exports.up = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.string('instructions');
        table.boolean('leaveAtDoor');
    });
};

exports.down = function (knex) {
    return knex.schema.table('centsCustomerAddresses', function (table) {
        table.dropColumn('instructions');
        table.dropColumn('leaveAtDoor');
    });
};
