exports.up = function (knex) {
    return knex.schema.createTable('batches', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
        table.string('batchName');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('batches');
};
