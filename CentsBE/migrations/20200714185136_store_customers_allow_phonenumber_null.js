exports.up = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.string('phoneNumber').nullable().alter();
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.string('phoneNumber').notNullable().alter();
    });
};
