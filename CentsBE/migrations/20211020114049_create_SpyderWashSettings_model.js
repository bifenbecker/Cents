exports.up = function (knex) {
    return knex.schema.createTable('spyderWashSettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable(),
            table.foreign('storeId').references('id').inTable('stores');
        table.string('email').notNullable();
        table.string('password').notNullable();
        table.string('posId');
        table.string('operatorCode');
        table.string('locationCode');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('spyderWashSettings');
};
