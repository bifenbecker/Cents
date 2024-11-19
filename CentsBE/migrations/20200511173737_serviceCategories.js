exports.up = function (knex) {
    return knex.schema.createTable('serviceCategories', function (table) {
        table.increments('id');
        table.string('category').notNullable();
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('imageUrl').nullable();
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('serviceCategories');
};
