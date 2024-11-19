exports.up = function (knex) {
    return knex.schema.createTable('inventoryItems', function (table) {
        table.increments('id');
        table.integer('categoryId').notNullable();
        table.foreign('categoryId').references('id').inTable('categories');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.string('name').notNullable();
        table.float('price').notNullable();
        table.integer('quantity').notNullable().defaultTo(0);
        table.boolean('isDeleted');
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventoryItems');
};
