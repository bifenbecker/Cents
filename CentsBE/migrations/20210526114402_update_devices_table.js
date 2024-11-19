exports.up = function (knex) {
    return knex.schema.table('devices', function (table) {
        table.dropColumn('privateKey');
        table.boolean('isPaired').defaultTo(false);
        table.string('status').defaultTo('OFFLINE');
    });
};
exports.down = function (knex) {
    return knex.schema.table('devices', function (table) {
        table.text('privateKey');
        table.dropColumn('isPaired');
        table.dropColumn('status');
    });
};
