exports.up = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.dropColumn('minOrderAmountInCents');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.integer('minOrderAmountInCents').defaultTo(0);
    });
};
