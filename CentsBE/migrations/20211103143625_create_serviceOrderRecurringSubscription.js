exports.up = function (knex) {
    return knex.schema.createTable('serviceOrderRecurringSubscription', function (table) {
        table.increments('id');
        table.integer('serviceOrderId');
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.integer('recurringSubscriptionId');
        table.foreign('recurringSubscriptionId').references('id').inTable('recurringSubscription');
        table.float('recurringDiscountInPercent');
        table.integer('servicePriceId');
        table.foreign('servicePriceId').references('id').inTable('servicePrices');
        table.specificType('modifierIds', 'int[]');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceOrderRecurringSubscription');
};
