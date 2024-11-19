exports.up = function (knex) {
    return knex.schema.createTable('teamMembersCheckIn', function (table) {
        table.increments('id');
        table.integer('teamMemberId').notNullable();
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('shiftId');
        table.foreign('shiftId').references('id').inTable('shifts');
        table.boolean('isCheckedIn').defaultTo(false);
        table.timestamp('checkInTime');
        table.timestamp('checkOutTime');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('teamMembersCheckIn');
};
