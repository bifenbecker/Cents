
exports.up = async function(knex) {
    await knex.schema.alterTable('serviceOrders', function (table) {
        table.integer('tierId');
        table.foreign('tierId').references('id').inTable('pricingTiers');
    });
    return knex.schema.table('serviceOrders', function (table) {
        table.index(['tierId'])
    })
};

exports.down = function(knex) {
    return knex.schema.table('serviceOrders', function (table) {
        table.dropColumn('tierId');
    });
};
