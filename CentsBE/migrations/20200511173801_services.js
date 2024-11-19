exports.up = function (knex) {
    return knex.schema.createTable('servicesMaster', function (table) {
        table.increments('id');
        table.integer('serviceCategoryId').notNullable();
        table.foreign('serviceCategoryId').references('id').inTable('serviceCategories');
        table.string('description').nullable();
        table.string('name').notNullable();
        table.float('defaultPrice').nullable();
        table.float('minQty').nullable();
        table.float('minPrice').nullable();
        table.boolean('hasMinPrice').defaultTo(false);
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('servicesMaster');
};
