exports.up = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.integer('languageId').nullable();
        table.foreign('languageId').references('id').inTable('languages');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeCustomers', function (table) {
        table.dropForeign('languageId');
        table.dropColumn('languageId');
    });
};
