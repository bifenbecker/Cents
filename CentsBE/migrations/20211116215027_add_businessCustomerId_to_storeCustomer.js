
exports.up = async function(knex) {
    await knex.schema.alterTable('storeCustomers', function (table) {
        table.integer('businessCustomerId');
        table.foreign('businessCustomerId').references('id').inTable('businessCustomers');
    });
    return knex.schema.table('storeCustomers', function (table) {
        table.index(['businessCustomerId'])
    })
};

exports.down = function(knex) {
    return knex.schema.table('storeCustomers', function (table) {
        table.dropColumn('businessCustomerId');
    });
};
