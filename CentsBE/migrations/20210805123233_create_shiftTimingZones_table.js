exports.up = function (knex) {
    return knex.schema.createTable('shiftTimingZones', function (table) {
        table.increments('id');
        table.integer('timingId').notNullable();
        table.foreign('timingId').references('id').inTable('timings');
        table.specificType('zoneIds', 'int[]');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt').defaultTo(null);
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('shiftTimingZones');
};
