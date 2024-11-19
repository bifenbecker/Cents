exports.up = function (knex) {
    return knex.schema.createTable('orderDeliveries', function (table) {
        table.increments('id');
        table.integer('storeId').notNullable(),
            table.foreign('storeId').references('id').inTable('stores');
        table.integer('orderId').notNullable();
        table.foreign('orderId').references('id').inTable('orders');
        table.integer('storeCustomerId').notNullable();
        table.foreign('storeCustomerId').references('id').inTable('storeCustomers');
        table.integer('thirdPartyDeliveryId');
        table.string('address1').notNullable();
        table.string('address2');
        table.string('city').notNullable();
        table.string('firstLevelSubdivisonCode').notNullable();
        table.string('postalCode').notNullable();
        table.string('countryCode').notNullable();
        table.jsonb('instructions');
        table.string('customerName').notNullable();
        table.string('customerPhoneNumber').notNullable();
        table.string('customerEmail');
        table.float('totalDeliveryCost').notNullable();
        table.float('serviceFee');
        table.float('courierTip');
        table.string('deliveryProvider').notNullable();
        table.timestamp('deliveredAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orderDeliveries');
};
