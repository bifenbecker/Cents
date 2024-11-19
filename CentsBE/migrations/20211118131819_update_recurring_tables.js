exports.up = function (knex) {
    return knex.schema
        .alterTable('serviceOrderRecurringSubscription', (table) => {
            table.dropForeign('recurringSubscriptionId');
        })
        .renameTable('recurringSubscription', 'recurringSubscriptions')
        .renameTable('serviceOrderRecurringSubscription', 'serviceOrderRecurringSubscriptions')
        .alterTable('serviceOrderRecurringSubscriptions', function (table) {
            table
                .foreign('recurringSubscriptionId')
                .references('id')
                .inTable('recurringSubscriptions');
        })
        .alterTable('serviceOrders', function (table) {
            table.dropForeign('serviceOrderRecurringSubscriptionId');
            table
                .foreign('serviceOrderRecurringSubscriptionId')
                .references('id')
                .inTable('serviceOrderRecurringSubscriptions');
        });
};

exports.down = function (knex) {
    return knex.schema
        .alterTable('serviceOrderRecurringSubscriptions', (table) => {
            table.dropForeign('recurringSubscriptionId');
        })
        .renameTable('recurringSubscriptions', 'recurringSubscription')
        .renameTable('serviceOrderRecurringSubscriptions', 'serviceOrderRecurringSubscription')
        .alterTable('serviceOrderRecurringSubscription', function (table) {
            table
                .foreign('recurringSubscriptionId')
                .references('id')
                .inTable('recurringSubscription');
        })
        .alterTable('serviceOrders', function (table) {
            table.dropForeign('serviceOrderRecurringSubscriptionId');
            table
                .foreign('serviceOrderRecurringSubscriptionId')
                .references('id')
                .inTable('serviceOrderRecurringSubscription');
        });
};
