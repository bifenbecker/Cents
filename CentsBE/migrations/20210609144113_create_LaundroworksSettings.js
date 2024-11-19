exports.up = function (knex) {
    return knex.schema.createTable('laundroworksSettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable(),
            table.foreign('storeId').references('id').inTable('stores');
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('customerKey').notNullable();
        table.string('laundroworksLocationId').notNullable();
        table.string('laundroworksPosNumber').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
        table.boolean('isDeleted').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('laundroworksSettings');
};
