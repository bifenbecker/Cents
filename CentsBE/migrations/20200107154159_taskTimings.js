exports.up = function (knex) {
    return knex.schema.createTable('taskTimings', function (table) {
        table.increments('id');
        table.integer('taskId').notNullable();
        table.foreign('taskId').references('id').inTable('tasks');
        table.integer('timingsId').notNullable();
        table.foreign('timingsId').references('id').inTable('timings');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('taskTimings');
};
