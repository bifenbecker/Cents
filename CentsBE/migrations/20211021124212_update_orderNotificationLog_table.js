exports.up = function (knex) {
    return knex.schema.alterTable('orderNotificationLogs', function (table) {
        table.string('eventName');
    });
};

exports.down = function (knex) {
    return knex.schema.table('orderNotificationLogs', function (table) {
        table.dropColumn('eventName');
    });
};
