exports.up = function (knex) {
    return knex.schema.alterTable('centsCustomers', function (table) {
        table.dropUnique('phoneNumber');
        table.string('phoneNumber').nullable().alter();
        table.integer('languageId').nullable().alter();
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('centsCustomers', function (table) {
        table.unique('phoneNumber');
        table.string('phoneNumber').notNullable().alter();
        table.integer('languageId').notNullable().alter();
    });
};
