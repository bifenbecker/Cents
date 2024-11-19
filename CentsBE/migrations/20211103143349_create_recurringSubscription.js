exports.up = function (knex) {
    return knex.schema.createTable('recurringSubscription', function (table) {
        table.increments('id');
        table.integer('storeId');
        table.foreign('storeId').references('id').inTable('stores');
        table.integer('centsCustomerId');
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.integer('centsCustomerAddressId');
        table.foreign('centsCustomerAddressId').references('id').inTable('centsCustomerAddresses');
        table.integer('pickupTimingsId');
        table.foreign('pickupTimingsId').references('id').inTable('timings');
        table.integer('returnTimingsId');
        table.foreign('returnTimingsId').references('id').inTable('timings');
        table.specificType('pickupWindow', 'int[]');
        table.specificType('returnWindow', 'int[]');
        table.integer('servicePriceId');
        table.foreign('servicePriceId').references('id').inTable('servicePrices');
        table.specificType('modifierIds', 'int[]');
        table.string('paymentToken');
        table.string('recurringRule');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
        table.timestamp('deletedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('recurringSubscription');
};
