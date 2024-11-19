exports.up = function (knex) {
    return knex.schema.createTable('roles', function (table) {
        table.increments('id');
        table.string('userType').notNullable().unique();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
