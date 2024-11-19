exports.up = function (knex) {
    return knex.schema.createTable('machineModels', function (table) {
        table.increments('id');
        table.string('modelName');
        table.string('capacity');
        table.integer('typeId').notNullable();
        table.foreign('typeId').references('id').inTable('machineTypes');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machineModels');
};
