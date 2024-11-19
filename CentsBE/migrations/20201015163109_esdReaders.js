exports.up = function (knex) {
    return knex.schema.createTable('esdReaders', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable(),
            table.foreign('storeId').references('id').inTable('stores');
        table.string('esdLocationId');
        table.string('deviceSerialNumber');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('esdReaders');
};
