exports.up = function (knex) {
    return knex.schema.createTable('cashDrawerEndEvents', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('teamMemberId').notNullable();
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.string('employeeCode').notNullable();
        table.string('employeeName');
        table.integer('cashSalesAmount').notNullable();
        table.integer('cashRefundAmount').notNullable().defaultTo(0);
        table.integer('expectedInDrawer').notNullable();
        table.integer('actualInDrawer').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cashDrawerEndEvents');
};
