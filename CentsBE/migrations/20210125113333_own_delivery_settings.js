exports.up = function (knex) {
    return knex.schema.createTable('ownDeliverySettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.boolean('active').defaultTo(true);
        table.specificType('zipCodes', 'int[]');
        table.integer('deliverFeeInCents').defaultTo(0);
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('ownDeliverySettings');
};
