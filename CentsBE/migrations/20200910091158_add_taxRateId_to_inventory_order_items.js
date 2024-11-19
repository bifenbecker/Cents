exports.up = function (knex) {
    return knex.schema.table('inventoryOrderLineItems', function (table) {
        table.integer('taxRateId');
        table.foreign('taxRateId').references('id').inTable('taxRates');
        table.float('lineItemTaxRate');
    });
};

exports.down = function (knex) {
    return knex.schema.table('inventoryOrderLineItems', function (table) {
        table.dropColumn('lineItemTaxRate');
        table.dropForeign('taxRateId');
        table.dropColumn('taxRateId');
    });
};
