
exports.up = async function(knex) {
    await knex.schema.alterTable('zones', function (table) {
        table.integer('deliveryTierId');
        table.foreign('deliveryTierId').references('id').inTable('pricingTiers');
    });
    return knex.schema.table('zones', function (table) {
        table.index(['deliveryTierId'])
    })
};

exports.down = function(knex) {
    return knex.schema.table('zones', function (table) {
        table.dropColumn('deliveryTierId');
    });
};
