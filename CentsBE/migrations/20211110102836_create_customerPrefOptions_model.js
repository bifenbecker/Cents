
exports.up = function(knex) {
    return knex.schema.createTable('customerPrefOptions', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable(),
            table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('type').notNullable();
        table.string('fieldName').notNullable();
        table.jsonb('options');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('customerPrefOptions');
};
