exports.up = function (knex) {
    return knex.schema.alterTable('serviceReferenceItemDetails', function (table) {
        table.integer('lineItemTaxInCents').defaultTo(0);
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('serviceReferenceItemDetails', function (table) {
        table.dropColumn('lineItemTaxInCents');
    });
};
