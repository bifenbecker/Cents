exports.up = function (knex) {
    return knex.schema.alterTable('recurringSubscription', function (table) {
        table.specificType('pickupWindow', 'bigint ARRAY').alter();
        table.specificType('returnWindow', 'bigint ARRAY').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('recurringSubscription', function (table) {
        table.specificType('pickupWindow', 'int[]').alter();
        table.specificType('returnWindow', 'int[]').alter();
    });
};
