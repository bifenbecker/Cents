exports.up = function (knex) {
    return knex.schema.createTable('turns', function (table) {
        table.increments('id');
        table.string('serviceType');
        table.integer('storeCustomerId');
        table.foreign('storeCustomerId').references('id').inTable('storeCustomers');
        table.string('technicianName');
        table.string('note');
        table.integer('machineId').notNullable();
        table.foreign('machineId').references('id').inTable('machines');
        table.integer('deviceId').notNullable();
        table.foreign('deviceId').references('id').inTable('devices');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.string('status');
        table.integer('deviceOrderId');
        table.integer('lmCycleId');
        table.string('turnCode');
        table.integer('netOrderTotalInCents');
        table.timestamp('startedAt');
        table.timestamp('completedAt');
        table.timestamp('enabledAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('turns');
};
