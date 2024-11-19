exports.up = function (knex) {
    return knex.schema.createTable('orderNotificationLogs', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.string('status');
        table.string('phoneNumber');
        table.timestamp('notifiedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderNotificationLogs');
};
