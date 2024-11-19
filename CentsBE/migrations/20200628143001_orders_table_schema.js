exports.up = function (knex) {
    return knex.schema.createTable('orders', function (table) {
        table.increments('id');
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('orderableId').notNullable();
        table.string('orderableType').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orders');
};
