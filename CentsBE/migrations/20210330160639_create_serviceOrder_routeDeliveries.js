exports.up = function (knex) {
    return knex.schema.createTable('serviceOrderRouteDeliveries', function (table) {
        table.increments('id');
        table.integer('routeDeliveryId').notNullable();
        table.foreign('routeDeliveryId').references('id').inTable('routeDeliveries');
        table.integer('serviceOrderId').notNullable();
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.string('type');
        table.boolean('overriddenScan').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceOrderRouteDeliveries');
};
