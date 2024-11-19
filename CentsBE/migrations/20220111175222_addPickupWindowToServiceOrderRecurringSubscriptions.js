exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrderRecurringSubscriptions', (table) => {
        table.specificType('pickupWindow', 'int[]');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrderRecurringSubscriptions', (table) => {
        table.dropColumn('pickupWindow');
    });
};
