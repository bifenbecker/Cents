
exports.up = function(knex) {
    return knex.schema.alterTable('serviceOrders', function (table) {
        table.dropColumn('serviceOrderRecurringSubscriptionId');        
    });
};

exports.down = function(knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.integer('serviceOrderRecurringSubscriptionId');
        table.foreign('serviceOrderRecurringSubscriptionId').references('id').inTable('serviceOrderRecurringSubscription');
    });
};
