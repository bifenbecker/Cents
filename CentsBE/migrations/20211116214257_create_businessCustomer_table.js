
exports.up = async function(knex) {
    await knex.schema.createTable('businessCustomers', function (table) {
        table.increments('id');
        table.integer('businessId');
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('centsCustomerId');
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.integer('commercialTierId');
        table.foreign('commercialTierId').references('id').inTable('pricingTiers');
        table.boolean('isCommercial');
        table.specificType('storeIds', 'INT[]');
        table.float('creditAmount');
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
    return knex.schema.table('businessCustomers', function (table) {
        table.index(['businessId']);
        table.index(['centsCustomerId']);
        table.index(['commercialTierId'])
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('businessCustomers');
};
