exports.up = function (knex) {
    return knex.schema.createTable('paymentMethods', function (table) {
        table.increments('id');
        table.integer('centsCustomerId').notNullable();
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.string('provider').notNullable();
        table.string('type').notNullable();
        table.string('paymentMethodToken').notNullable();
        table.boolean('isDeleted');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('paymentMethods');
};
