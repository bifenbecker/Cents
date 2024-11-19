exports.up = function (knex) {
    return knex.schema.createTable('route', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('timingId').notNullable();
        table.foreign('timingId').references('id').inTable('timings');
        table.integer('driverId').notNullable();
        table.foreign('driverId').references('id').inTable('teamMembers');
        table.string('status');
        table.timestamp('startedAt');
        table.timestamp('completedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('route');
};
