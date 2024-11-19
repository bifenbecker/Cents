exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('email').nullable().alter();
        table.string('firstname').nullable().alter();
        table.string('password').nullable().alter();
        // phone -> Alter might not be possible if there are duplicates.
        table.unique('phone');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        // email, firstname, password -> Alter might not be possible if they contain null values.
        table.string('email').notNullable().alter();
        table.string('firstname').notNullable().alter();
        table.string('password').notNullable().alter();
        table.dropUnique('phone');
    });
};
