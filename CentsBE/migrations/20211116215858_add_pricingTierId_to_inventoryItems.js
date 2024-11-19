
exports.up = async function(knex) {
    await knex.schema.alterTable('inventoryItems', function (table) {
        table.integer('pricingTierId');
        table.foreign('pricingTierId').references('id').inTable('pricingTiers');
    });
    return knex.schema.table('inventoryItems', function (table) {
        table.index(['pricingTierId'])
    });
};

exports.down = function(knex) {
    return knex.schema.table('inventoryItems', function (table) {
        table.dropColumn('pricingTierId');
    });
};
