exports.up = function (knex) {
    return knex.schema.createTable('storeThemes', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.inherits('businessThemes');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('storeThemes');
};
