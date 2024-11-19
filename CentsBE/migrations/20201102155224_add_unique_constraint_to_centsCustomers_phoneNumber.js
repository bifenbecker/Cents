exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomers', function (table) {
        table.unique('phoneNumber');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsCustomers', function (table) {
        table.dropUnique('phoneNumber');
    });
};
