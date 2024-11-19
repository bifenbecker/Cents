exports.up = function (knex) {
    return knex.schema.createTable('inventoryOrders', function (table) {
        table.increments('id');
        table.string('orderCode');
        table.integer('customerId').nullable();
        table.foreign('customerId').references('id').inTable('users');
        table.integer('employeeId').nullable();
        table.foreign('employeeId').references('id').inTable('teamMembers');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.string('status');
        table.string('paymentStatus');
        table.float('orderTotal', 6, 2);
        table.float('salesTaxAmount', 6, 2);
        table.float('netOrderTotal', 6, 2);
        table.integer('promotionId');
        table.foreign('promotionId').references('id').inTable('businessPromotionPrograms');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventoryOrders');
};
