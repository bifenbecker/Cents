exports.up = function (knex) {
    return knex.schema.createTable('prices', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('laundryTypeId').notNullable();
        table.foreign('laundryTypeId').references('id').inTable('laundryTypes');
        table.integer('detergentTypeId');
        table.foreign('detergentTypeId').references('id').inTable('detergentTypes');
        table.float('price', 6, 2);
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('prices');
};
