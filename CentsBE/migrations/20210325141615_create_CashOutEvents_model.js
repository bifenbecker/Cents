exports.up = function (knex) {
    return knex.schema.createTable('cashOutEvents', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('teamMemberId').notNullable();
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.string('employeeCode').notNullable();
        table.string('employeeName');
        table.integer('totalCashChanged').notNullable();
        table.integer('amountLeftInDrawer').notNullable();
        table.integer('totalCashPaymentSum').notNullable();
        table.specificType('paymentIds', 'int[]');
        table.string('type').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cashOutEvents');
};
