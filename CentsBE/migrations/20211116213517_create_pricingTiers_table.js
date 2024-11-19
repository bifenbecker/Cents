
exports.up = async function(knex) {
    await knex.schema.createTable('pricingTiers', function (table) {
        table.increments('id');
        table.integer('businessId');
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name');
        table.enum('type', ['COMMERCIAL', 'DELIVERY']).notNullable();
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
    return knex.schema.table('pricingTiers', function (table) {
        table.index(['businessId']);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('pricingTiers');

};
