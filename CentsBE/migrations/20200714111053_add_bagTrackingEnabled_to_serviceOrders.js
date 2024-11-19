exports.up = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.boolean('isBagTrackingEnabled').defaultTo('false');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('isBagTrackingEnabled');
    });
};
