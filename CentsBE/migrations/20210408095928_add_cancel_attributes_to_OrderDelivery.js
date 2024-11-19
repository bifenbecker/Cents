exports.up = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.string('cancellationReason');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('orderDeliveries', function (table) {
        table.dropColumn('cancellationReason');
    });
};
