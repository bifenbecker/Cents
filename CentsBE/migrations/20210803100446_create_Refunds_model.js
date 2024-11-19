exports.up = function (knex) {
    return knex.schema.createTable('refunds', function (table) {
        table.increments('id');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.integer('paymentId').notNullable();
        table.foreign('paymentId').references('id').inTable('payments');
        table.integer('refundAmountInCents').notNullable();
        table.string('thirdPartyRefundId');
        table.string('refundProvider').notNullable();
        table.string('status').notNullable();
        table.string('currency').notNullable().defaultTo('usd');
        table.string('reason');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('refunds');
};
