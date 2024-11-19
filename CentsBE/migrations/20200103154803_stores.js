exports.up = function (knex) {
    return knex.schema.createTable('stores', function (table) {
        table.increments('id');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('name').notNullable();
        table.string('address').notNullable();
        table.string('city');
        table.string('state');
        table.string('zipCode');
        table.string('phoneNumber').notNullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('stores');
};
