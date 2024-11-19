exports.up = function (knex) {
    return knex.schema.createTable('storeSettings', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.float('lat', 6, 2);
        table.float('lng', 6, 2);
        table.string('googlePlacesId');
        table.integer('turnAroundInHours');
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('storeSettings');
};
