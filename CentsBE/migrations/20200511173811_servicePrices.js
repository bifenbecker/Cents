exports.up = function (knex) {
    return knex.schema.createTable('servicePrices', function (table) {
        table.increments('id');
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('serviceId');
        table.foreign('serviceId').references('id').inTable('servicesMaster');
        table.float('storePrice').nullable();
        table.float('minQty').nullable();
        table.float('minPrice').nullable();
        table.timestamp('deletedAt').nullable().defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('servicePrices');
};
