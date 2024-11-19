exports.up = function (knex) {
    return knex.schema.createTable('inventory', function (table) {
        table.increments('id');
        table.integer('categoryId').notNullable();
        table.foreign('categoryId').references('id').inTable('inventoryCategories');
        table.string('description').nullable();
        table.string('productName').notNullable();
        table.float('price').nullable();
        table.integer('quantity').notNullable().defaultTo(0);
        table.string('productImage').nullable();
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventory');
};
