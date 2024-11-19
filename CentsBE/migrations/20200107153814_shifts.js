exports.up = function (knex) {
    return knex.schema.createTable('shifts', function (table) {
        table.increments('id');
        table.string('name').notNullable();
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('shifts');
};
