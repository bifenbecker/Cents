exports.up = function (knex) {
    return knex.schema.createTable('payments', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.integer('customerId').notNullable();
        table.foreign('customerId').references('id').inTable('users');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.string('status').notNullable();
        table.float('totalAmount', 6, 2).notNullable();
        table.float('transactionFee', 6, 2).notNullable();
        table.float('tax', 6, 2).notNullable();
        table.integer('serviceId').notNullable();
        table.foreign('serviceId').references('id').inTable('services');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.string('paymentToken').notNullable();
        table.string('stripeClientSecret').notNullable();
        table.string('currency').notNullable();
        table.string('destinationAccount').notNullable();
        table.string('paymentProcessor').notNullable();
        table.float('appliedAmount', 6, 2);
        table.float('unappliedAmount', 6, 2);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('payments');
};
