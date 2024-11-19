exports.up = function (knex) {
    return knex.schema.alterTable('serviceOrderRecurringSubscriptions', function (table) {
        table.specificType('pickupWindow', 'bigint ARRAY').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('serviceOrderRecurringSubscriptions', function (table) {
        table.specificType('pickupWindow', 'int[]').alter();
    });
};
