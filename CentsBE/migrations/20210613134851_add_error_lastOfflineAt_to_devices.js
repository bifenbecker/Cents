exports.up = function (knex) {
    return knex.schema.table('devices', function (table) {
        table.jsonb('error');
        table.timestamp('lastOfflineAt');
    });
};

exports.down = function (knex) {
    return knex.schema.table('devices', function (table) {
        table.dropColumn('lastOfflineAt');
        table.dropColumn('error');
    });
};
