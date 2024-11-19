exports.up = function (knex) {
    return knex.schema.createTable('centsDeliverySettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.boolean('active').defaultTo(true);
        table.integer('subsidyInCents').defaultTo(0);
        table.float('minSubsidyWeight', 3, 2);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('centsDeliverySettings');
};
