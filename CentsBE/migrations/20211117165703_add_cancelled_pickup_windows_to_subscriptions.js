exports.up = function (knex) {
    return knex.schema.alterTable('recurringSubscription', function (table) {
        table.specificType('cancelledPickupWindows', 'bigint ARRAY');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('recurringSubscription', function (table) {
        table.dropColumn('cancelledPickupWindows');
    });
};
