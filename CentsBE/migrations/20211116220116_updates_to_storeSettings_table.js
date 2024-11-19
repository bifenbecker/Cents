
exports.up = async function(knex) {
    await knex.schema.alterTable('storeSettings', function (table) {
        table.integer('deliveryTierId');
        table.foreign('deliveryTierId').references('id').inTable('pricingTiers');
        table.enum('deliveryPriceType', ['RETAIL', 'DELIVERY_TIER']);
    });
    return knex.schema.table('storeSettings', function (table) {
        table.index(['deliveryTierId'])
    })
};

exports.down = function(knex) {
    return knex.schema.table('storeSettings', function (table) {
        table.dropColumn('deliveryTierId');
        table.dropColumn('deliveryPriceType')
    });
};
