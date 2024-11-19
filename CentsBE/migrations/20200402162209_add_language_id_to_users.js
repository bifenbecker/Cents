exports.up = function (knex) {
    return knex.schema.table('users', function (table) {
        table.integer('languageId');
        table.foreign('languageId').references('id').inTable('languages');
    });
};

exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
        table.dropForeign('languageId');
        table.dropColumn('languageId');
    });
};
