exports.up = function (knex) {
    return knex.schema.createTable('centsCustomerAddresses', function (table) {
        table.increments('id');
        table.integer('centsCustomerId').notNullable();
        table.foreign('centsCustomerId').references('id').inTable('centsCustomers');
        table.string('address1').notNullable();
        table.string('address2');
        table.string('city').notNullable();
        table.string('firstLevelSubdivisonCode').notNullable();
        table.string('postalCode').notNullable();
        table.string('countryCode').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('centsCustomerAddresses');
};
