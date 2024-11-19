
exports.up = function(knex) {
    return knex.schema.createTable('customerPreferences', function (table) {
        table.increments('id');
        table.integer('customerId').notNullable(),
            table.foreign('customerId').references('id').inTable('centsCustomers');
        table.integer('businessId').notNullable(),
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('optionId').notNullable(),
            table.foreign('optionId').references('id').inTable('customerPrefOptions');
        table.string('choice');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('customerPreferences');
};
