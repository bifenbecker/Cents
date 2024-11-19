exports.up = function (knex) {
    return knex.schema.createTable('machineModelLoads', function (table) {
        table.increments('id');
        table.integer('modelId').notNullable();
        table.foreign('modelId').references('id').inTable('machineModels');
        table.integer('loadId').notNullable();
        table.foreign('loadId').references('id').inTable('machineLoadTypes');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machineModelLoads');
};
