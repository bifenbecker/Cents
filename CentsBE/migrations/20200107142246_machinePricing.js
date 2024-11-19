exports.up = function (knex) {
    return knex.schema.createTable('machinePricing', function (table) {
        table.increments('id').notNullable();
        table.integer('machineId').notNullable();
        table.foreign('machineId').references('id').inTable('machines');
        table.float('price', 6, 2);
        table.string('unit');
        table.integer('unitLot');
        table.integer('unitTime');
        table.integer('loadId').notNullable();
        table.foreign('loadId').references('id').inTable('machineModelLoads');
        table.boolean('isDeleted').defaultTo('false');
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machinePricing');
};
