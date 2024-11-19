exports.up = function (knex) {
    return knex.schema.createTable('recurringOrderLogs', function (table) {
        table.increments('id');
        table.integer('recurringSubscriptionId');
        table.foreign('recurringSubscriptionId').references('id').inTable('recurringSubscriptions');
        table.integer('serviceOrderId');
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.integer('clonedFromId');
        table.foreign('clonedFromId').references('id').inTable('serviceOrders');
        table.jsonb('payload');
        table.string('errorMessage');
        table.text('stack');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('recurringOrderLogs');
};
