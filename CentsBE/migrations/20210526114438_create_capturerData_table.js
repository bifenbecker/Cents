exports.up = function (knex) {
    return knex.schema.createTable('capturerData', function (table) {
        table.increments('id');
        table.integer('userId');
        table.foreign('userId').references('id').inTable('users');
        table.integer('teamMemberId');
        table.foreign('teamMemberId').references('id').inTable('teamMembers');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('capturerData');
};
