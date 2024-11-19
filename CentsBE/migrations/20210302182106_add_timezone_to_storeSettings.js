exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.string('timeZone');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('timeZone');
    });
};
