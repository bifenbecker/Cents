exports.up = function (knex) {
    return knex.schema.createTable('centsCustomers', function (table) {
        table.increments('id');
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('email');
        table.string('password').notNullable();
        table.string('phoneNumber').unique().notNullable();
        table.string('resetPasswordToken');
        table.timestamp('passwordResetDate');
        table.integer('languageId').notNullable();
        table.foreign('languageId').references('id').inTable('languages');
        table.boolean('isDeleted').defaultTo(false);
        table.timestamp('deletedAt');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('centsCustomers');
};
