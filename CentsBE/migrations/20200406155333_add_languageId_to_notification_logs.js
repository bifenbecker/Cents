exports.up = function (knex) {
    return knex.schema.table('orderNotificationLogs', function (table) {
        table.integer('languageId');
        table.foreign('languageId').references('id').inTable('languages');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderNotificationLogs', function (table) {
        table.dropForeign('languageId');
        table.dropColumn('languageId');
    });
};
