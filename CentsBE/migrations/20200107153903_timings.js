exports.up = function (knex) {
    return knex.schema.createTable('timings', function (table) {
        table.increments('id');
        table.integer('shiftId').notNullable();
        table.foreign('shiftId').references('id').inTable('shifts');
        table.enum('day', [0, 1, 2, 3, 4, 5, 6]).notNullable();
        table.timestamp('startTime');
        table.timestamp('endTime');
        table.boolean('isActive').defaultTo(true);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('timings');
};
