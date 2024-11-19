exports.up = function (knex) {
    return knex.schema.createTable('orderActivityLog', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.string('status');
        table.string('employeeCode');
        table.string('employeeName');
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderActivityLog');
};
