exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.boolean('turnAroundInHoursSetManually').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('turnAroundInHoursSetManually');
    });
};
