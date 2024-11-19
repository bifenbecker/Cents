exports.up = function (knex) {
    return knex.schema.createTable('userRoles', function (table) {
        table.increments('id');
        table.integer('roleId').notNullable();
        table.foreign('roleId').references('id').inTable('roles');
        table.integer('userId').notNullable();
        table.foreign('userId').references('id').inTable('users');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('userRoles');
};
