exports.up = function (knex) {
    return knex.schema.createTable('orderAdjustmentLog', function (table) {
        table.increments('id');
        table.integer('serviceOrderId').notNullable(),
            table.foreign('serviceOrderId').references('id').inTable('serviceOrders');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.text('notes');
        table.float('previousOrderTotal').notNullable();
        table.float('newOrderTotal').notNullable();
        table.float('previousNetOrderTotal').notNullable();
        table.float('newNetOrderTotal').notNullable();
        table.integer('promotionId');
        table.foreign('promotionId').references('id').inTable('businessPromotionPrograms');
        table.float('consumedCredits', 6, 2);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderAdjustmentLog');
};
