exports.up = function (knex) {
    return knex.schema.createTable('machineQrCodes', function (table) {
        table.increments('id').notNullable();
        table.string('hash').unique();
        table.integer('machineId').unsigned().nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt').defaultTo(null);

        table.foreign('machineId').references('machines.id');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machineQrCodes');
};
