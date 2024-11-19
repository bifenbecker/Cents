
exports.up = function(knex) {
    return knex.schema.createTable('preferenceOptions', function (table) {
        table.increments('id');
        table.integer('businessCustomerPreferenceId').notNullable();
        table.foreign('businessCustomerPreferenceId').references('id').inTable('businessCustomerPreferences');
        table.string('value').notNullable();
        table.boolean('isDefault').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('preferenceOptions');
};

