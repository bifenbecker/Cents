exports.up = function (knex) {
    return knex.schema.createTable('creditHistory', function (table) {
        table.increments('id');
        table.float('amount').notNullable();
        table.integer('reasonId').notNullable();
        table.foreign('reasonId').references('id').inTable('creditReasons');
        table.integer('customerId').notNullable();
        table.foreign('customerId').references('id').inTable('centsCustomers');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt').defaultTo(null);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('creditHistory');
};
