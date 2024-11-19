exports.up = function (knex) {
    return knex.schema.createTable('machinePaymentType', function (table) {
        table.increments('id');
        table.string('type');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('machinePaymentType');
};
