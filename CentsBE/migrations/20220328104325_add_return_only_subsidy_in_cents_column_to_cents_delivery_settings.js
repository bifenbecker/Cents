exports.up = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.integer('returnOnlySubsidyInCents').defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('centsDeliverySettings', function (table) {
        table.dropColumn('returnOnlySubsidyInCents');
    });
};
