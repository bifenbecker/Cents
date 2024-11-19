exports.up = function (knex) {
    return knex.schema.createTable('storageRacks', function (table) {
        table.increments('id');
        table.integer('serviceOrderId').notNullable();
        table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.string('rackInfo');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('storageRacks');
};
