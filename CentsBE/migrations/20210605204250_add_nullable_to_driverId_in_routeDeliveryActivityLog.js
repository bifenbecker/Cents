exports.up = function (knex) {
    return knex.schema.alterTable('routeDeliveryActivityLogs', function (table) {
        table.integer('driverId').nullable().alter();
    });
};

exports.down = function (knex) {
    // adding back notNull clause will fail the down part.
    Promise.resolve();
};
