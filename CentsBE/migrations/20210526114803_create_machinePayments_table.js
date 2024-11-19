exports.up = function (knex) {
    return knex.schema.createTable('machinePayments', function (table) {
        table.increments('id');
        table.jsonb('details');
        table.integer('paymentTypeId').notNullable();
        table.foreign('paymentTypeId').references('id').inTable('machinePaymentType');
        table.integer('turnId').notNullable();
        table.foreign('turnId').references('id').inTable('turns');
        table.integer('paymentId');
        table.foreign('paymentId').references('id').inTable('payments');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machinePayments');
};
