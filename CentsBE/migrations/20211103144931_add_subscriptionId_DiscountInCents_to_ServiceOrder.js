exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('recurringDiscountInCents').defaultTo(0);
        table.integer('serviceOrderRecurringSubscriptionId');
        table
            .foreign('serviceOrderRecurringSubscriptionId')
            .references('id')
            .inTable('serviceOrderRecurringSubscription');
    });
};

exports.down = function (knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('recurringDiscountInCents');
        table.dropColumn('serviceOrderRecurringSubscriptionId');
    });
};
