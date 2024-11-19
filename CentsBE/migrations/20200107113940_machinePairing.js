exports.up = function (knex) {
    return knex.schema.createTable('pairing', function (table) {
        table.increments('id');
        table.integer('deviceId').notNullable();
        table.foreign('deviceId').references('id').inTable('devices');
        table.integer('machineId').notNullable();
        table.foreign('machineId').references('id').inTable('machines');
        table.boolean('isDeleted').defaultTo(false);
        table.boolean('isActive').defaultTo(true);
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('pairing');
};
