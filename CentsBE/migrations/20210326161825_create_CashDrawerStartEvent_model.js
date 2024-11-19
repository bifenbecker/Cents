exports.up = function (knex) {
    return knex.schema.createTable('cashDrawerStartEvents', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('teamMemberId').notNullable();
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.string('employeeCode').notNullable();
        table.string('employeeName');
        table.integer('startingCashAmount').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cashDrawerStartEvents');
};
