exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id');
        table.string('firstname').notNullable();
        table.string('lastname');
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('phone');
        table.boolean('isVerified').defaultTo(false);
        table.string('resetPasswordToken');
        table.timestamp('passwordResetDate');
        table.boolean('isActive').defaultTo(true);
        table.boolean('isGlobalVerified').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
