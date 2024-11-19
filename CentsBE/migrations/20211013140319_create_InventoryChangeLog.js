exports.up = function (knex) {
    return knex.schema.createTable('inventoryChangeLog', function (table) {
        table.increments('id');
        table.integer('inventoryItemId').notNullable();
        table.foreign('inventoryItemId').references('id').inTable('inventoryItems');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('orderId');
        table.foreign('orderId').references('id').inTable('orders');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.integer('startingAmount').notNullable();
        table.integer('amountChanged').notNullable();
        table.integer('endingAmount').notNullable();
        table.string('reason');
        table.string('entryPoint').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('inventoryChangeLog');
};
