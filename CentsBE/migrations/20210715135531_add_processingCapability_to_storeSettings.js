exports.up = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.enum('processingCapability', ['BASIC', 'ADVANCED']).defaultTo('BASIC');
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('processingCapability');
    });
};
