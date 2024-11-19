exports.up = function (knex) {
    return knex.schema.createTable('machines', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('modelId').notNullable();
        table.foreign('modelId').references('id').inTable('machineModels');
        table.string('name');
        table.string('serialNumber').unique();
        table.string('manufacturer');
        table.boolean('isActive');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machines');
};
