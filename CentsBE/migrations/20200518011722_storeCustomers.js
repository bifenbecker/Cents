exports.up = function (knex) {
    return knex.schema.createTable('storeCustomers', function (table) {
        table.increments('id');
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('email');
        table.string('phoneNumber').notNullable();
        table.text('notes');
        table.integer('centsCustomerId').notNullable();
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.integer('storeId').notNullable();
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('storeCustomers');
};
