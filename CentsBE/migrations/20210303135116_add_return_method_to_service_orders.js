exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.string('returnMethod');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('storeSettings', function (table) {
        table.dropColumn('returnMethod');
    });
};
