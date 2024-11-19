
exports.up = function(knex) {
    return knex.schema.createTable('customerPreferencesOptionSelection', function (table) {
        table.increments('id');
        table.integer('centsCustomerId').notNullable();
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.integer('preferenceOptionId').notNullable();
        table.foreign('preferenceOptionId').references('id').inTable('preferenceOptions');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('customerPreferencesOptionSelection');
};
