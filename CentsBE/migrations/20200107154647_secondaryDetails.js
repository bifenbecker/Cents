exports.up = function (knex) {
    return knex.schema.createTable('secondaryDetails', function (table) {
        table.increments('id');
        table.integer('userId').notNullable();
        table.foreign('userId').references('id').inTable('users');
        table.integer('businessId').notNullable();
        table.foreign('businessId').references('id').inTable('laundromatBusiness');
        table.string('fullName');
        table.string('phoneNumber');
        table.string('email');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('secondaryDetails');
};
