exports.up = function (knex) {
    return knex.schema.createTable('cciSettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable(),
            table.foreign('storeId').references('id').inTable('stores');
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.integer('cciStoreId');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
        table.string('machineId');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cciSettings');
};
