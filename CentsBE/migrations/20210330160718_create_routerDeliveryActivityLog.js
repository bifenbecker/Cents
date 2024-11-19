exports.up = function (knex) {
    return knex.schema.createTable('routeDeliveryActivityLogs', function (table) {
        table.increments('id');
        table.integer('routeDeliveryId').notNullable();
        table.foreign('routeDeliveryId').references('id').inTable('routeDeliveries');
        table.integer('driverId').notNullable();
        table.foreign('driverId').references('id').inTable('teamMembers');
        table.string('status');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('routeDeliveryActivityLogs');
};
