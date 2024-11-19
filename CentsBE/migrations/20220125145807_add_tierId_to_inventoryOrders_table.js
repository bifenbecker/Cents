
exports.up = async function(knex) {
    await knex.schema.alterTable('inventoryOrders', function (table) {
        table.integer('tierId');
        table.foreign('tierId').references('id').inTable('pricingTiers');
    });
    return knex.schema.table('inventoryOrders', function (table) {
        table.index(['tierId'])
    })
};

exports.down = function(knex) {
    return knex.schema.table('inventoryOrders', function (table) {
        table.dropColumn('tierId');
    });
};
