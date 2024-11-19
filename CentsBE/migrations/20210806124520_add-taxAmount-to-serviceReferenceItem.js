exports.up = function (knex) {
    return Promise.all([
        knex.schema.table('serviceReferenceItemDetails', function (table) {
            table.dropColumn('lineItemTaxInCents');
        }),
        knex.schema.table('serviceOrderItems', function (table) {
            table.integer('taxAmountInCents').defaultTo(0);
        }),
    ]);
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.table('serviceReferenceItemDetails', function (table) {
            table.integer('lineItemTaxInCents').defaultTo(0);
        }),
        knex.schema.table('serviceOrderItems', function (table) {
            table.dropColumn('taxAmountInCents');
        }),
    ]);
};
